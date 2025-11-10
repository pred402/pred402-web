'use client';

/**
 * Staking Widget with X402 Payment Integration
 *
 * This component allows users to stake on prediction market agents
 * with automatic x402 payment handling
 */

import { useState } from 'react';
import { Button } from '@ui/components/button';
import { Input } from '@ui/components/input';
import { Label } from '@ui/components/label';
import { createPaymentClient, makePaymentRequest } from '../lib/x402-client';
import { formatUSDCAmount } from '../lib/x402-config';
import { toast } from 'sonner';

export interface StakingWidgetProps {
  themeId: string;
  agentId: number;
  agentName: string;
  wallet: any; // Solana wallet from your wallet provider
  onStakeSuccess?: (result: any) => void;
}

export function StakingWidget({
  themeId,
  agentId,
  agentName,
  wallet,
  onStakeSuccess,
}: StakingWidgetProps) {
  const [amount, setAmount] = useState('5'); // Default 5 USDC
  const [isLoading, setIsLoading] = useState(false);

  const handleStake = async () => {
    if (!wallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);

    try {
      // Create x402 payment client
      const client = createPaymentClient({ wallet });

      // Get user's wallet address
      const userWallet = wallet.publicKey?.toString();

      if (!userWallet) {
        throw new Error('Unable to get wallet address');
      }

      // Make payment-protected stake request
      const response = await makePaymentRequest(client, '/api/stake', {
        method: 'POST',
        body: JSON.stringify({
          themeId,
          agentId,
          amount: parseFloat(amount),
          userWallet,
        }),
      });

      if (response.success) {
        toast.success(`Successfully staked ${amount} USDC on ${agentName}!`);
        onStakeSuccess?.(response.data);
        setAmount('5'); // Reset to default
      } else if (response.paymentRequired) {
        toast.error('Payment failed. Please try again.');
      } else {
        toast.error(response.error || 'Failed to process stake');
      }
    } catch (error) {
      console.error('Stake error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-6">
      <div>
        <h3 className="text-lg font-semibold">Stake on {agentName}</h3>
        <p className="text-sm text-muted-foreground">
          Support this prediction agent with your stake
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (USDC)</Label>
        <Input
          id="amount"
          type="number"
          min="0.1"
          step="0.1"
          value={amount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
          placeholder="Enter amount in USDC"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Minimum: 1 USDC
        </p>
      </div>

      <div className="flex items-center justify-between rounded-md bg-muted p-3">
        <span className="text-sm font-medium">Total Payment:</span>
        <span className="text-lg font-bold">{amount || '0'} USDC</span>
      </div>

      <Button
        onClick={handleStake}
        disabled={isLoading || !wallet || !amount || parseFloat(amount) < 1}
        className="w-full"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Processing Payment...
          </span>
        ) : (
          'Stake with X402'
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Payment powered by{' '}
        <a
          href="https://payai.network"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          PayAI X402
        </a>
      </p>
    </div>
  );
}
