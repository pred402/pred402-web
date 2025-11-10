'use client';

/**
 * useX402Payment Hook
 *
 * React hook for managing x402 payments
 */

import { useState, useCallback } from 'react';
import { createPaymentClient, makePaymentRequest } from '../lib/x402-client';
import type { PaymentResponse } from '../lib/x402-client';

export interface UseX402PaymentOptions {
  wallet: any; // Solana wallet
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useX402Payment({ wallet, onSuccess, onError }: UseX402PaymentOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const processPayment = useCallback(
    async <T = any,>(endpoint: string, options?: RequestInit): Promise<PaymentResponse<T>> => {
      if (!wallet) {
        const error = 'Wallet not connected';
        setLastError(error);
        onError?.(error);
        return { success: false, error };
      }

      setIsProcessing(true);
      setLastError(null);

      try {
        const client = createPaymentClient({ wallet });
        const response = await makePaymentRequest<T>(client, endpoint, options);

        if (response.success && response.data) {
          onSuccess?.(response.data);
        } else if (response.error) {
          setLastError(response.error);
          onError?.(response.error);
        }

        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Payment failed';
        setLastError(errorMessage);
        onError?.(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsProcessing(false);
      }
    },
    [wallet, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setLastError(null);
    setIsProcessing(false);
  }, []);

  return {
    processPayment,
    isProcessing,
    lastError,
    reset,
    isReady: !!wallet,
  };
}
