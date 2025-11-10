'use client';

/**
 * Stake Example Component
 *
 * Example usage of the StakingWidget with x402 payment
 */

import { StakingWidget } from './StakingWidget';
import { toast } from 'sonner';

export interface StakeExampleProps {
  wallet: any; // Your Solana wallet adapter
}

export function StakeExample({ wallet }: StakeExampleProps) {
  const handleStakeSuccess = (result: any) => {
    console.log('Stake successful:', result);
    // You can add additional logic here, such as:
    // - Updating local state
    // - Refreshing data
    // - Navigating to another page
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Prediction Market Staking</h1>
          <p className="text-muted-foreground">
            Stake on your favorite prediction agents using X402 payments
          </p>
        </div>

        {!wallet?.connected ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              Please connect your Solana wallet to continue
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Example agents */}
            <StakingWidget
              themeId="theme-123"
              agentId={0}
              agentName="AI Agent Alpha"
              wallet={wallet}
              onStakeSuccess={handleStakeSuccess}
            />

            <StakingWidget
              themeId="theme-123"
              agentId={1}
              agentName="AI Agent Beta"
              wallet={wallet}
              onStakeSuccess={handleStakeSuccess}
            />
          </div>
        )}

        <div className="rounded-lg bg-muted p-6">
          <h3 className="font-semibold mb-2">How it works:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Connect your Solana wallet</li>
            <li>Choose an AI agent to support</li>
            <li>Enter your stake amount (minimum 1 USDC)</li>
            <li>Click "Stake with X402" - payment will be automatically processed</li>
            <li>Your stake is recorded on-chain</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
