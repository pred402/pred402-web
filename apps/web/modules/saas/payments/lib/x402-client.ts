'use client';

/**
 * X402 Client Wrapper
 *
 * This provides a wrapper around x402-solana client for use in React components
 */

import { createX402Client } from 'x402-solana/client';
import type { X402Client } from 'x402-solana/client';
import { X402_CONFIG, getUSDCAddress } from './x402-config';

export interface X402ClientConfig {
  wallet: any; // Solana wallet adapter
  maxPaymentAmount?: bigint;
}

/**
 * Create X402 client instance
 */
export function createPaymentClient(config: X402ClientConfig): X402Client {
  return createX402Client({
    wallet: config.wallet,
    network: X402_CONFIG.network,
    maxPaymentAmount: config.maxPaymentAmount || X402_CONFIG.maxPaymentAmount,
  });
}

/**
 * Payment response type
 */
export interface PaymentResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  paymentRequired?: boolean;
}

/**
 * Make a payment-protected API request
 */
export async function makePaymentRequest<T = any>(
  client: X402Client,
  endpoint: string,
  options?: RequestInit
): Promise<PaymentResponse<T>> {
  try {
    const response = await client.fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 402) {
        return {
          success: false,
          paymentRequired: true,
          error: 'Payment required',
        };
      }

      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Request failed with status ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Payment request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
