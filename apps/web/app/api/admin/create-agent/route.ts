/**
 * Admin API: Create Agent on Solana
 *
 * This endpoint creates a new AI agent on the Solana blockchain
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  Connection,
  Keypair,
  SystemProgram,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { AnchorProvider, BN, Program } from '@coral-xyz/anchor';
import { z } from 'zod';
import bs58 from 'bs58';

// Import IDL
import idl from '../../../../lib/solana/idl/ai_prediction_market.json';

// Constants
const PROGRAM_ID = new PublicKey("2EbRqaaFbjAsMVYbSZ4m4k2nLqhnjG1SxV6QgY8UnmzG");

// NodeWallet implementation for Anchor
class NodeWallet {
  constructor(readonly payer: Keypair) {}

  get publicKey(): PublicKey {
    return this.payer.publicKey;
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
    (tx as any).sign([this.payer]);
    return tx;
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
    return txs.map((tx) => {
      (tx as any).sign([this.payer]);
      return tx;
    });
  }
}

// PDA derivation functions
function getConfigPDA(configId: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("config"), new BN(configId).toArrayLike(Buffer, "le", 2)],
    PROGRAM_ID
  );
}

function getAgentPDA(configId: number, agentId: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("agent"),
      new BN(configId).toArrayLike(Buffer, "le", 2),
      new BN(agentId).toArrayLike(Buffer, "le", 2)
    ],
    PROGRAM_ID
  );
}

function getAgentPerformancePDA(configId: number, agentId: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("agent_perf"),
      new BN(configId).toArrayLike(Buffer, "le", 2),
      new BN(agentId).toArrayLike(Buffer, "le", 2)
    ],
    PROGRAM_ID
  );
}

// Transaction builder
async function buildAndSendV0Tx(
  provider: AnchorProvider,
  instructions: TransactionInstruction[],
  signers: Keypair[] = []
): Promise<string> {
  const connection = provider.connection;
  const payer = provider.wallet.publicKey;

  const latestBlockhash = await connection.getLatestBlockhash();

  const messageV0 = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: latestBlockhash.blockhash,
    instructions,
  }).compileToV0Message();

  const transaction = new VersionedTransaction(messageV0);

  // Sign with admin wallet
  if ('signTransaction' in provider.wallet) {
    const signedTx = await provider.wallet.signTransaction(transaction);

    // Sign with additional signers (agent keypair)
    if (signers.length > 0) {
      signedTx.sign(signers);
    }

    const signature = await connection.sendRawTransaction(signedTx.serialize());
    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });
    return signature;
  }

  throw new Error('Wallet does not support signing');
}

// Request schema
const CreateAgentSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  metadataUri: z.string().url(),
  agentPrivateKey: z.string().min(1), // Base58 encoded private key
});

type CreateAgentRequest = z.infer<typeof CreateAgentSchema>;

/**
 * POST /api/admin/create-agent
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication using Better Auth
    const { auth } = await import('@repo/auth');
    const { headers: nextHeaders } = await import('next/headers');
    const session = await auth.api.getSession({ headers: await nextHeaders() });

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    // Parse request
    const body = await request.json();
    const data = CreateAgentSchema.parse(body);

    // Load admin keypair
    if (!process.env.ADMIN_PRIVATE_KEY) {
      throw new Error('ADMIN_PRIVATE_KEY not configured');
    }

    const adminKeypair = Keypair.fromSecretKey(
      bs58.decode(process.env.ADMIN_PRIVATE_KEY)
    );

    // Parse agent keypair
    const agentKeypair = Keypair.fromSecretKey(
      bs58.decode(data.agentPrivateKey)
    );

    // Connect to Solana
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );

    const wallet = new NodeWallet(adminKeypair);
    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    const program = new Program(idl as any, provider);

    // Get agent ID from on-chain config account's next_agent_id
    const configId = 1;
    const [configPDA] = getConfigPDA(configId);

    // Fetch config account to get next_agent_id
    const configAccountInfo = await connection.getAccountInfo(configPDA);
    if (!configAccountInfo) {
      throw new Error('Config account not found');
    }

    // Parse next_agent_id from config account
    // Config struct: discriminator(8) + config_id(2) + admin(32) + oracle_signer(32) + fee_treasury(32) + mint(32) + min_user_stake(8) + max_agents(2) + next_agent_id(2)
    const offset = 8 + 2 + 32 + 32 + 32 + 32 + 8 + 2; // = 148
    const agentIdBuffer = Buffer.from(configAccountInfo.data.subarray(offset, offset + 2));
    const agentId = agentIdBuffer.readUInt16LE(0);

    console.log('Next agent ID from config:', agentId);

    // Prepare PDAs
    const [agentPDA] = getAgentPDA(configId, agentId);
    const [agentPerfPDA] = getAgentPerformancePDA(configId, agentId);

    // Metadata
    const metadataUri = data.metadataUri;
    const metadataHash = new Array(32).fill(0); // Empty hash for now

    // Build create agent instruction
    const createAgentIx: TransactionInstruction = await (program.methods as any)
      .createAgent(metadataUri, metadataHash)
      .accounts({
        admin: adminKeypair.publicKey,
        config: configPDA,
        agentAuthority: agentKeypair.publicKey,
        agent: agentPDA,
        agentPerformance: agentPerfPDA,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    // Send transaction
    const signature = await buildAndSendV0Tx(provider, [createAgentIx], [agentKeypair]);

    // Save to database
    const { db } = await import('@repo/database');
    const dbAgent = await (db as any).agent.create({
      data: {
        agentId,
        agentPda: agentPDA.toBase58(),
        slug: data.slug,
        name: data.name,
        description: data.description,
        avatarUrl: data.avatarUrl,
        privateKey: data.agentPrivateKey,
        authorityPubkey: agentKeypair.publicKey.toBase58(),
        metadataUri,
        configId,
        isActive: true,
        txSignature: signature,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: dbAgent.id,
        agentId,
        agentPDA: agentPDA.toBase58(),
        authorityPubkey: agentKeypair.publicKey.toBase58(),
        signature,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      },
    });

  } catch (error) {
    console.error('Create agent error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create agent',
      },
      { status: 500 }
    );
  }
}
