/**
 * X402 Payment Configuration
 *
 * This file contains configuration for x402-solana payment integration
 */

export const X402_CONFIG = {
  // Network configuration
  network: (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'solana-devnet') as 'solana-devnet' | 'solana',

  // Treasury wallet address (where payments are received)
  treasuryAddress: process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS || '',

  // Facilitator URL for payment processing
  facilitatorUrl: process.env.NEXT_PUBLIC_X402_FACILITATOR_URL || 'https://facilitator.payai.network',

  // USDC token addresses
  usdcAddress: {
    'solana-devnet': '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    'solana': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  } as const,

  // Default max payment amount (in lamports/smallest unit)
  maxPaymentAmount: BigInt(100_000_000), // 100 USDC

  // Payment pricing
  pricing: {
    minStakeAmount: '1000000', // 1 USDC minimum
    defaultStakeAmount: '5000000', // 5 USDC default
  },
} as const;

/**
 * Get USDC address for current network
 */
export function getUSDCAddress(): string {
  return X402_CONFIG.usdcAddress[X402_CONFIG.network];
}

/**
 * Format amount from USDC smallest unit to human readable
 */
export function formatUSDCAmount(amount: string | number | bigint): string {
  const numAmount = typeof amount === 'bigint' ? Number(amount) : Number(amount);
  return (numAmount / 1_000_000).toFixed(2);
}

/**
 * Parse USDC amount from human readable to smallest unit
 */
export function parseUSDCAmount(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Math.floor(numAmount * 1_000_000).toString();
}
