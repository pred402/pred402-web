/**
 * Payment Module Exports
 *
 * Central export file for all payment-related functionality
 */

// X402 Configuration
export { X402_CONFIG, getUSDCAddress, formatUSDCAmount, parseUSDCAmount } from './lib/x402-config';

// Client-side
export { createPaymentClient, makePaymentRequest } from './lib/x402-client';
export type { X402ClientConfig, PaymentResponse } from './lib/x402-client';

// Server-side
export {
  createX402Handler,
  createPaymentRequirements,
  verifyPaymentFromRequest,
  handlePaymentRequest,
} from './lib/x402-server';
export type { PaymentRequirement } from './lib/x402-server';

// Hooks
export { useX402Payment } from './hooks/use-x402-payment';
export type { UseX402PaymentOptions } from './hooks/use-x402-payment';

// Components
export { StakingWidget } from './components/StakingWidget';
export type { StakingWidgetProps } from './components/StakingWidget';
export { StakeExample } from './components/StakeExample';
export type { StakeExampleProps } from './components/StakeExample';
