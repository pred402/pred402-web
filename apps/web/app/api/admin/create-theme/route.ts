/**
 * Admin API: Create Theme (Event) on Solana
 *
 * This endpoint creates a new prediction theme with options on the Solana blockchain
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
  AddressLookupTableAccount
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AnchorProvider, BN, Program } from '@coral-xyz/anchor';
import { z } from 'zod';

// Import IDL
import idl from '../../../../lib/solana/idl/ai_prediction_market.json';

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

// Constants
const PROGRAM_ID = new PublicKey("2EbRqaaFbjAsMVYbSZ4m4k2nLqhnjG1SxV6QgY8UnmzG");
const USDC_MINT_DEVNET = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");

// PDA derivation functions
function getConfigPDA(configId: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("config"), new BN(configId).toArrayLike(Buffer, "le", 2)],
    PROGRAM_ID
  );
}

function getThemePDA(configId: number, themeId: BN): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("theme"),
      new BN(configId).toArrayLike(Buffer, "le", 2),
      themeId.toArrayLike(Buffer, "le", 8)
    ],
    PROGRAM_ID
  );
}

function getOptionStatePDA(theme: PublicKey, optionIndex: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("option_state"), theme.toBuffer(), Buffer.from([optionIndex])],
    PROGRAM_ID
  );
}

function getOptionVaultPDA(theme: PublicKey, optionIndex: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("option_vault"), theme.toBuffer(), Buffer.from([optionIndex])],
    PROGRAM_ID
  );
}

// Transaction builder
async function buildAndSendV0Tx(
  provider: AnchorProvider,
  instructions: TransactionInstruction[]
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

  // Sign transaction
  if ('signTransaction' in provider.wallet) {
    const signedTx = await provider.wallet.signTransaction(transaction);
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
const CreateThemeSchema = z.object({
  themeId: z.number().positive(),
  title: z.string().min(1),
  description: z.string().optional(),
  metadataUri: z.string().url(),
  totalOptions: z.number().min(2).max(10),
  options: z.array(z.object({
    label: z.string().min(1),
    labelUri: z.string().url(),
  })).min(2).max(10),
  endTime: z.number().positive(), // 用户投注结束时间（秒级时间戳）
  resolutionTime: z.number().positive(), // 结算时间（秒级时间戳）
});

type CreateThemeRequest = z.infer<typeof CreateThemeSchema>;

/**
 * POST /api/admin/create-theme
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
    const data = CreateThemeSchema.parse(body);

    // Load admin keypair
    if (!process.env.ADMIN_PRIVATE_KEY) {
      throw new Error('ADMIN_PRIVATE_KEY not configured');
    }

    // Decode base58 private key
    const bs58 = await import('bs58');
    const adminKeypair = Keypair.fromSecretKey(
      bs58.default.decode(process.env.ADMIN_PRIVATE_KEY)
    );

    // Connect to Solana
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );

    const wallet = new NodeWallet(adminKeypair);
    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    const program = new Program(idl as any, provider);

    // Use timestamps from frontend directly (already in seconds)
    const resolutionTime = new BN(data.resolutionTime);
    const endTime = new BN(data.endTime);

    // Prepare theme data
    const configId = 1;
    const themeId = new BN(data.themeId);
    const metadataHash = new Array(32).fill(0);
    const metadataUri = data.metadataUri;

    const options = data.options.map((opt, idx) => ({
      labelUri: opt.labelUri,
      labelHash: new Array(32).fill(idx),
    }));

    const [configPDA] = getConfigPDA(configId);
    const [themePDA] = getThemePDA(configId, themeId);
    const mint = USDC_MINT_DEVNET;

    // Build create theme instruction
    const createThemeIx: TransactionInstruction = await (program.methods as any)
      .createTheme({
        themeId,
        metadataUri: data.metadataUri,
        metadataHash,
        totalOptions: data.totalOptions,
        options,
        resolutionTime,
        endTime,
      })
      .accounts({
        config: configPDA,
        theme: themePDA,
        admin: adminKeypair.publicKey,
        mint,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    // Build initialize option vault instructions
    const initOptionIxs: TransactionInstruction[] = [];
    for (let i = 0; i < data.totalOptions; i++) {
      const [optionStatePDA] = getOptionStatePDA(themePDA, i);
      const [optionVaultPDA] = getOptionVaultPDA(themePDA, i);

      const ix: TransactionInstruction = await (program.methods as any)
        .initializeOptionVault(i)
        .accounts({
          config: configPDA,
          theme: themePDA,
          payer: adminKeypair.publicKey,
          optionState: optionStatePDA,
          optionVault: optionVaultPDA,
          mint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      initOptionIxs.push(ix);
    }

    // Send transaction
    const allInstructions = [createThemeIx, ...initOptionIxs];
    const signature = await buildAndSendV0Tx(provider, allInstructions);

    // Save to database
    const { db } = await import('@repo/database');

    // Calculate option PDAs
    const optionPdas: Array<{ optionStatePDA: string; optionVaultPDA: string }> = [];
    for (let i = 0; i < data.totalOptions; i++) {
      const [optionStatePDA] = getOptionStatePDA(themePDA, i);
      const [optionVaultPDA] = getOptionVaultPDA(themePDA, i);
      optionPdas.push({
        optionStatePDA: optionStatePDA.toBase58(),
        optionVaultPDA: optionVaultPDA.toBase58(),
      });
    }

    // Create theme and options in database
    const dbTheme = await (db as any).solanaTheme.create({
      data: {
        themeId: data.themeId,
        themePda: themePDA.toBase58(),
        title: data.title,
        description: data.description,
        metadataUri: metadataUri,
        endTime: new Date(data.endTime * 1000), // Convert from seconds to ms
        resolutionTime: new Date(data.resolutionTime * 1000),
        totalOptions: data.totalOptions,
        status: 'ACTIVE',
        txSignature: signature,
        createdById: session.user.id,
        options: {
          create: data.options.map((opt, idx) => ({
            optionIndex: idx,
            label: opt.label,
            labelUri: opt.labelUri,
            optionStatePda: optionPdas[idx].optionStatePDA,
            optionVaultPda: optionPdas[idx].optionVaultPDA,
          })),
        },
      },
      include: {
        options: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: dbTheme.id,
        themeId: data.themeId,
        themePDA: themePDA.toBase58(),
        signature,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
        options: dbTheme.options,
      },
    });

  } catch (error) {
    console.error('Create theme error:', error);

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
        error: error instanceof Error ? error.message : 'Failed to create theme',
      },
      { status: 500 }
    );
  }
}
