/**
 * Solana Program Integration
 *
 * Utilities for loading and interacting with the AI Prediction Market program
 */

import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, Commitment } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import idl from "./idl/ai_prediction_market.json";

// Program ID from your deployed contract
export const PROGRAM_ID = new PublicKey("2EbRqaaFbjAsMVYbSZ4m4k2nLqhnjG1SxV6QgY8UnmzG");

// Devnet USDC mint
export const USDC_MINT_DEVNET = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");

/**
 * Load the prediction market program
 */
export function loadProgram(provider: AnchorProvider): Program {
  return new Program(idl as Idl, provider);
}

/**
 * Create provider from connection and wallet
 */
export function createProvider(
  connection: Connection,
  wallet: Wallet,
  opts?: { commitment?: Commitment }
): AnchorProvider {
  return new AnchorProvider(
    connection,
    wallet,
    { commitment: (opts?.commitment || "confirmed") as Commitment }
  );
}

/**
 * Create provider from keypair (for server-side operations)
 */
export function createProviderFromKeypair(
  connection: Connection,
  keypair: Keypair,
  opts?: { commitment?: Commitment }
): AnchorProvider {
  const wallet = new Wallet(keypair);
  return createProvider(connection, wallet, opts);
}
