/**
 * Stake API Route with X402 Payment Integration
 *
 * This endpoint handles user staking with x402 payment verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { handlePaymentRequest } from '@saas/payments/lib/x402-server';
import { z } from 'zod';

/**
 * Stake request schema
 */
const StakeRequestSchema = z.object({
  themeId: z.string(),
  agentId: z.number(),
  amount: z.number().positive(),
  userWallet: z.string(),
});

type StakeRequest = z.infer<typeof StakeRequestSchema>;

/**
 * POST /api/stake
 *
 * Process a stake with x402 payment
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const validatedData = StakeRequestSchema.parse(body);

    // Handle payment-protected request
    return await handlePaymentRequest(
      request,
      {
        amount: validatedData.amount,
        description: `Stake ${validatedData.amount} USDC on Agent ${validatedData.agentId} for Theme ${validatedData.themeId}`,
        memo: `theme:${validatedData.themeId}|agent:${validatedData.agentId}`,
      },
      async (paymentData: any) => {
        // Payment verified - process the stake

        // TODO: Integrate with your Solana program
        // This is where you would call your prediction market program
        // to record the stake on-chain

        const result = await processStake(validatedData, paymentData);

        return {
          success: true,
          data: result,
          message: 'Stake processed successfully',
        };
      }
    );
  } catch (error) {
    console.error('Stake API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Process the stake (integrate with your Solana program)
 */
async function processStake(data: StakeRequest, paymentData: any) {
  // TODO: Implement your Solana program integration here
  // This should call your prediction market program to record the stake

  console.log('Processing stake:', {
    themeId: data.themeId,
    agentId: data.agentId,
    amount: data.amount,
    userWallet: data.userWallet,
    paymentData,
  });

  // Example return structure
  return {
    transactionId: 'placeholder-tx-id',
    themeId: data.themeId,
    agentId: data.agentId,
    amount: data.amount,
    timestamp: new Date().toISOString(),
  };
}
