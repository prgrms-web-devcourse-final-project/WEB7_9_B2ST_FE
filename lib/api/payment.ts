import {
  typedPaymentApi,
  type PaymentRequest,
  type PaymentResponse,
} from "./typed-payment";

export interface PaymentApiResponse {
  success: boolean;
  data: PaymentResponse | null;
  error: string | null;
}

class PaymentApi {
  async pay(request: PaymentRequest): Promise<PaymentApiResponse> {
    try {
      const data = await typedPaymentApi.pay(request);
      return {
        success: true,
        data,
        error: null,
      };
    } catch (error) {
      console.error("결제 실패:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "결제에 실패했습니다.",
      };
    }
  }
}

export const paymentApi = new PaymentApi();
export type { PaymentRequest, PaymentResponse };
