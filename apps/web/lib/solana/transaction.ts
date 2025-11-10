import { AnchorProvider } from '@coral-xyz/anchor';
import {
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

export async function buildAndSendV0Tx(
  provider: AnchorProvider,
  instructions: TransactionInstruction[],
  signers: any[] = []
): Promise<string> {
  const latestBlockhash = await provider.connection.getLatestBlockhash();

  const messageV0 = new TransactionMessage({
    payerKey: provider.wallet.publicKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions,
  }).compileToV0Message();

  const tx = new VersionedTransaction(messageV0);

  // Sign with wallet
  if (typeof provider.wallet.signTransaction === 'function') {
    await provider.wallet.signTransaction(tx);
  } else {
    throw new Error('Wallet does not support signing');
  }

  // Sign with additional signers if any
  if (signers.length > 0) {
    tx.sign(signers);
  }

  const signature = await provider.connection.sendTransaction(tx, {
    maxRetries: 3,
  });

  await provider.connection.confirmTransaction({
    signature,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  });

  return signature;
}
