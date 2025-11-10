/**
 * API: User Invest with x402 Payment
 *
 * This endpoint handles user investment using x402 payment protocol
 * and executes proxy stake on behalf of the user
 */

import { NextResponse, NextRequest } from 'next/server';
import { Connection, PublicKey, Keypair, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountIdempotentInstruction } from '@solana/spl-token';
import { AnchorProvider, BN, Program, Idl } from '@coral-xyz/anchor';
import bs58 from 'bs58';
import { X402PaymentHandler } from 'x402-solana/server';
import { buildAndSendV0Tx } from '../../../lib/solana/transaction';
import IDL from '../../../lib/solana/ai_prediction_market.json';

// NodeWallet implementation
class NodeWallet {
  constructor(readonly payer: Keypair) {}

  get publicKey(): PublicKey {
    return this.payer.publicKey;
  }

  async signTransaction<T>(tx: T): Promise<T> {
    (tx as any).sign([this.payer]);
    return tx;
  }

  async signAllTransactions<T>(txs: T[]): Promise<T[]> {
    return txs.map((tx) => {
      (tx as any).sign([this.payer]);
      return tx;
    });
  }
}

// Initialize x402 payment handler
const x402 = new X402PaymentHandler({
  network: 'solana-devnet',
  treasuryAddress: process.env.X402_PROXY_WALLET_ADDRESS!,
  facilitatorUrl: 'https://facilitator.payai.network',
});

export async function POST(request: NextRequest) {
  try {
    // 1. Extract payment header
    const paymentHeader = x402.extractPayment(request.headers);

    const body = await request.json();
    const {
      themeId,
      agentId,
      amount, // In USDC
      userPublicKey,
    } = body;

    // Validate inputs
    if (!themeId || agentId === undefined || !amount || !userPublicKey) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Convert amount to micro-units string for x402
    const amountMicroUsdc = Math.floor(amount * 1_000_000).toString();

    // 2. Create payment requirements
    const paymentRequirements = await x402.createPaymentRequirements({
      price: {
        amount: amountMicroUsdc,
        asset: {
          address: process.env.NEXT_PUBLIC_USDC_MINT!, // USDC devnet mint
          decimals: 6, // USDC has 6 decimals
        }
      },
      network: 'solana-devnet',
      config: {
        description: `Invest ${amount} USDC in prediction market`,
        resource: `${process.env.NEXT_PUBLIC_SITE_URL}/api/invest` as `${string}://${string}`,
      }
    });

    if (!paymentHeader) {
      // Return 402 with payment requirements
      const response = x402.create402Response(paymentRequirements);
      return NextResponse.json(response.body, { status: response.status });
    }

    // 3. Verify payment
    const verified = await x402.verifyPayment(paymentHeader, paymentRequirements);
    if (!verified) {
      return NextResponse.json({ error: 'Invalid payment' }, { status: 402 });
    }

    // 4. Settle payment first - this transfers USDC to proxy wallet
    await x402.settlePayment(paymentHeader, paymentRequirements);

    // Setup connection
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );

    // Load proxy wallet (x402 payment receiver)
    const proxyWalletPrivateKey = process.env.X402_PROXY_WALLET_PRIVATE_KEY!;
    if (!proxyWalletPrivateKey) {
      return NextResponse.json(
        { error: 'X402 proxy wallet not configured' },
        { status: 500 }
      );
    }

    const proxyKeypair = Keypair.fromSecretKey(bs58.decode(proxyWalletPrivateKey));
    const proxyWallet = new NodeWallet(proxyKeypair);
    const provider = new AnchorProvider(connection, proxyWallet, { commitment: 'confirmed' });

    // Load program from IDL
    const programId = new PublicKey((IDL as any).address);
    const program = new Program(IDL as Idl, provider);

    // Setup constants
    const configId = 1;
    const mint = new PublicKey(process.env.NEXT_PUBLIC_USDC_MINT!);
    const beneficiary = new PublicKey(userPublicKey);

    // Helper functions to derive PDAs
    const getConfigPDA = (configId: number): [PublicKey, number] => {
      const configIdBuffer = Buffer.alloc(2);
      configIdBuffer.writeUInt16LE(configId, 0);
      return PublicKey.findProgramAddressSync(
        [Buffer.from('config'), configIdBuffer],
        programId
      );
    };

    const getThemePDA = (configId: number, themeId: BN): [PublicKey, number] => {
      return PublicKey.findProgramAddressSync(
        [
          Buffer.from("theme"),
          new BN(configId).toArrayLike(Buffer, "le", 2),
          themeId.toArrayLike(Buffer, "le", 8)
        ],
        programId
      );
    };

    const getAgentPDA = (configId: number, agentId: number): [PublicKey, number] => {
      const configIdBuffer = Buffer.alloc(2);
      configIdBuffer.writeUInt16LE(configId, 0);
      const agentIdBuffer = Buffer.alloc(2);
      agentIdBuffer.writeUInt16LE(agentId, 0);
      return PublicKey.findProgramAddressSync(
        [Buffer.from('agent'), configIdBuffer, agentIdBuffer],
        programId
      );
    };

    const getThemeAgentPDA = (themePDA: PublicKey, agentPDA: PublicKey): [PublicKey, number] => {
      return PublicKey.findProgramAddressSync(
        [Buffer.from('theme_agent'), themePDA.toBuffer(), agentPDA.toBuffer()],
        programId
      );
    };

    const getUserStakePDA = (user: PublicKey, themePDA: PublicKey, agentId: number): [PublicKey, number] => {
      const agentIdBuffer = Buffer.alloc(2);
      agentIdBuffer.writeUInt16LE(agentId, 0);
      return PublicKey.findProgramAddressSync(
        [Buffer.from('user_stake'), user.toBuffer(), themePDA.toBuffer(), agentIdBuffer],
        programId
      );
    };

    const getAgentVaultPDA = (themePDA: PublicKey, agentPDA: PublicKey): [PublicKey, number] => {
      return PublicKey.findProgramAddressSync(
        [Buffer.from('agent_vault'), themePDA.toBuffer(), agentPDA.toBuffer()],
        programId
      );
    };

    const getAgentVaultAuthorityPDA = (themePDA: PublicKey, agentPDA: PublicKey): [PublicKey, number] => {
      return PublicKey.findProgramAddressSync(
        [Buffer.from('agent_vault_authority'), themePDA.toBuffer(), agentPDA.toBuffer()],
        programId
      );
    };

    const getAgentPerformancePDA = (configId: number, agentId: number): [PublicKey, number] => {
      const configIdBuffer = Buffer.alloc(2);
      configIdBuffer.writeUInt16LE(configId, 0);
      const agentIdBuffer = Buffer.alloc(2);
      agentIdBuffer.writeUInt16LE(agentId, 0);
      return PublicKey.findProgramAddressSync(
        [Buffer.from('agent_perf'), configIdBuffer, agentIdBuffer],
        programId
      );
    };

    // Derive all PDAs
    const [configPDA] = getConfigPDA(configId);
    const [themePDA] = getThemePDA(configId, new BN(themeId));
    const [agentPDA] = getAgentPDA(configId, agentId);
    const [themeAgentPDA] = getThemeAgentPDA(themePDA, agentPDA);
    const [userStakePDA] = getUserStakePDA(beneficiary, themePDA, agentId);
    const [agentVaultPDA] = getAgentVaultPDA(themePDA, agentPDA);
    const [agentVaultAuthorityPDA] = getAgentVaultAuthorityPDA(themePDA, agentPDA);
    const [agentPerformancePDA] = getAgentPerformancePDA(configId, agentId);

    const proxySource = await getAssociatedTokenAddress(mint, proxyKeypair.publicKey);
    const adminKeypair = Keypair.fromSecretKey(bs58.decode(process.env.ADMIN_PRIVATE_KEY!));
    const feeTreasury = await getAssociatedTokenAddress(mint, adminKeypair.publicKey);

    // Convert amount to smallest unit (6 decimals for USDC)
    const stakeAmount = new BN(Math.floor(amount * 1_000_000));

    // Build instructions array
    const instructions: TransactionInstruction[] = [];

    // Check and create proxy source ATA if needed
    const proxySourceAccount = await connection.getAccountInfo(proxySource);
    if (!proxySourceAccount) {
      instructions.push(
        createAssociatedTokenAccountIdempotentInstruction(
          proxyKeypair.publicKey,
          proxySource,
          proxyKeypair.publicKey,
          mint
        )
      );
    }

    // Check and initialize theme_agent if needed
    const themeAgentAccount = await connection.getAccountInfo(themeAgentPDA);
    if (!themeAgentAccount) {
      const initThemeAgentIx = await (program.methods as any)
        .initializeThemeAgent()
        .accounts({
          config: configPDA,
          theme: themePDA,
          agent: agentPDA,
          payer: proxyKeypair.publicKey,
          themeAgent: themeAgentPDA,
          systemProgram: SystemProgram.programId,
        })
        .instruction();
      instructions.push(initThemeAgentIx);
    }

    // Check and initialize agent_vault if needed
    const agentVaultAccount = await connection.getAccountInfo(agentVaultPDA);
    if (!agentVaultAccount) {
      const initAgentVaultIx = await (program.methods as any)
        .initializeAgentVault()
        .accounts({
          config: configPDA,
          theme: themePDA,
          agent: agentPDA,
          payer: proxyKeypair.publicKey,
          agentVault: agentVaultPDA,
          agentVaultAuthority: agentVaultAuthorityPDA,
          mint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .instruction();
      instructions.push(initAgentVaultIx);
    }

    // Check and initialize user_stake if needed
    const userStakeAccount = await connection.getAccountInfo(userStakePDA);
    if (!userStakeAccount) {
      const initUserStakeIx = await (program.methods as any)
        .initializeUserStakeForBeneficiary(agentId, beneficiary)
        .accounts({
          config: configPDA,
          theme: themePDA,
          payer: proxyKeypair.publicKey,
          userStake: userStakePDA,
          systemProgram: SystemProgram.programId,
        })
        .instruction();
      instructions.push(initUserStakeIx);
    }

    // Create proxy stake instruction
    const proxyStakeIx = await (program.methods as any)
      .proxyStake(agentId, stakeAmount, beneficiary)
      .accounts({
        config: configPDA,
        theme: themePDA,
        agent: agentPDA,
        payer: proxyKeypair.publicKey,
        payerSource: proxySource,
        themeAgent: themeAgentPDA,
        agentVault: agentVaultPDA,
        agentVaultAuthority: agentVaultAuthorityPDA,
        userStake: userStakePDA,
        agentPerformance: agentPerformancePDA,
        feeTreasury,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    instructions.push(proxyStakeIx);

    // 5. Send proxy stake transaction
    const signature = await buildAndSendV0Tx(provider, instructions, []);

    return NextResponse.json({
      success: true,
      signature,
      message: 'Investment successful',
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
    });

  } catch (error) {
    console.error('Invest error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process investment',
      },
      { status: 500 }
    );
  }
}
