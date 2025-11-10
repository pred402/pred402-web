import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { useEffect, useState } from 'react';

// USDC mint address on devnet
const USDC_MINT_DEVNET = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

export function useUSDCBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setBalance(0);
      return;
    }

    let isSubscribed = true;

    async function fetchBalance() {
      if (!publicKey) return;

      setLoading(true);
      setError(null);

      try {
        // Get the associated token account address for USDC
        const tokenAccount = await getAssociatedTokenAddress(
          USDC_MINT_DEVNET,
          publicKey
        );

        // Get account info
        const accountInfo = await getAccount(connection, tokenAccount);

        if (isSubscribed) {
          // Convert from smallest unit (6 decimals for USDC)
          setBalance(Number(accountInfo.amount) / 1_000_000);
        }
      } catch (err) {
        console.error('Error fetching USDC balance:', err);
        if (isSubscribed) {
          // If account doesn't exist, balance is 0
          setBalance(0);
          setError(err instanceof Error ? err.message : 'Failed to fetch balance');
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    fetchBalance();

    return () => {
      isSubscribed = false;
    };
  }, [publicKey, connection]);

  return { balance, loading, error, refetch: () => {} };
}
