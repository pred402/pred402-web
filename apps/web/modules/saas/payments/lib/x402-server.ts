/**
 * X402 Server Handler
 *
 * Server-side payment processing with x402-solana
 */

import { X402PaymentHandler } from 'x402-solana/server';
import { X402_CONFIG, getUSDCAddress, parseUSDCAmount } from './x402-config';
import type { NextRequest } from 'next/server';

/**
 * Create X402 payment handler instance
 */
export function createX402Handler(): X402PaymentHandler {
  if (!X402_CONFIG.treasuryAddress) {
    throw new Error('NEXT_PUBLIC_TREASURY_WALLET_ADDRESS environment variable is required');
  }

  return new X402PaymentHandler({
    network: X402_CONFIG.network,
    treasuryAddress: X402_CONFIG.treasuryAddress,
    facilitatorUrl: X402_CONFIG.facilitatorUrl,
  });
}

/**
 * Payment requirement configuration
 */
export interface PaymentRequirement {
  amount: string | number; // Amount in USDC (e.g., 5 for 5 USDC)
  description?: string;
  memo?: string;
}

/**
 * Create payment requirements for a request
 */
export async function createPaymentRequirements(
  handler: X402PaymentHandler,
  requirement: PaymentRequirement
) {
  const amountInSmallestUnit = parseUSDCAmount(requirement.amount);

  return await handler.createPaymentRequirements({
    price: {
      amount: amountInSmallestUnit,
      asset: {
        address: getUSDCAddress(),
        decimals: 6,
      },
    },
    network: X402_CONFIG.network,
    config: {
      description: requirement.description || 'Payment for prediction market stake',
    },
  });
}

/**
 * Verify payment from request headers
 */
export async function verifyPaymentFromRequest(
  handler: X402PaymentHandler,
  request: NextRequest,
  requirement: PaymentRequirement
): Promise<{ verified: boolean; error?: string; paymentData?: any }> {
  try {
    const paymentHeader = handler.extractPayment(request.headers);

    if (!paymentHeader) {
      return {
        verified: false,
        error: 'No payment header found',
      };
    }

    // Create payment requirements for verification
    const paymentRequirements = await createPaymentRequirements(handler, requirement);

    // Verify the payment with facilitator
    const verifyResponse = await handler.verifyPayment(paymentHeader, paymentRequirements);

    if (!verifyResponse.isValid) {
      return {
        verified: false,
        error: verifyResponse.invalidReason || 'Invalid payment',
      };
    }

    return {
      verified: true,
      paymentData: {
        paymentHeader,
        verifyResponse,
      },
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Payment verification failed',
    };
  }
}

/**
 * Handle payment-protected request
 */
export async function handlePaymentRequest<T>(
  request: NextRequest,
  requirement: PaymentRequirement,
  handler: (paymentData: any) => Promise<T>
): Promise<Response> {
  const x402Handler = createX402Handler();

  // Check if payment is provided
  const verification = await verifyPaymentFromRequest(x402Handler, request, requirement);

  if (!verification.verified) {
    // Payment required - return 402 with payment requirements
    const paymentReqs = await createPaymentRequirements(x402Handler, requirement);

    return new Response(
      JSON.stringify({
        error: 'Payment required',
        paymentRequirements: paymentReqs,
      }),
      {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'X-Payment-Required': 'true',
        },
      }
    );
  }

  // Payment verified - process the request
  try {
    const result = await handler(verification.paymentData);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Request handler error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
