'use client';

import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useState, useEffect } from 'react';
import { BN } from '@coral-xyz/anchor';
import IDL from './ai_prediction_market.json';

export function useMinStake() {
  const { connection } = useConnection();
  const [minStake, setMinStake] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchMinStake() {
      try {
        setLoading(true);
        setError(null);

        const programId = new PublicKey((IDL as any).address);

        // Generate config PDA (configId = 1)
        const configId = 1;
        const [configPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from('config'), new BN(configId).toArrayLike(Buffer, 'le', 2)],
          programId
        );

        // Fetch config account
        const configAccount = await connection.getAccountInfo(configPDA);
        if (!configAccount) {
          throw new Error('Config account not found');
        }

        // Parse min_user_stake from account data
        // Config struct layout:
        // - discriminator: 8 bytes
        // - config_id: u16 = 2 bytes
        // - admin: pubkey = 32 bytes
        // - oracle_signer: pubkey = 32 bytes
        // - fee_treasury: pubkey = 32 bytes
        // - mint: pubkey = 32 bytes
        // - min_user_stake: u64 = 8 bytes <-- offset 138
        const data = configAccount.data;
        const offset = 8 + 2 + 32 + 32 + 32 + 32; // = 138
        const minimumStakeBuffer = data.slice(offset, offset + 8); // u64 is 8 bytes
        const minimumStakeLamports = new BN(minimumStakeBuffer, 'le');

        // Convert to USDC (6 decimals)
        const minimumStakeUsdc = minimumStakeLamports.toNumber() / 1_000_000;

        setMinStake(minimumStakeUsdc);
      } catch (err) {
        console.error('Error fetching min stake:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch min stake'));
        setMinStake(0.01); // Fallback value
      } finally {
        setLoading(false);
      }
    }

    fetchMinStake();
  }, [connection]);

  return { minStake, loading, error };
}
