import { PaymentWebhookHandler } from "./webhook";

export { WebhookSignatureError } from "./errors";
export type {
  CheckoutSessionData,
  PaymentProduct,
  SubscriptionData,
} from "./types";

/**
 * Payment service singleton. Behaviour is layered through a class chain
 * (billing -> subscriptions -> access grants -> webhook handler) so each method
 * keeps its original `this` calls and there is exactly one instance.
 */
class PaymentService extends PaymentWebhookHandler {
  private static instance: PaymentService;

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }
}

export const paymentService = PaymentService.getInstance();
