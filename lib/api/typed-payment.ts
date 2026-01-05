import { typedApiClient } from "./typed-client";

export interface PaymentRequest {
  domainType: "RESERVATION" | "PRERESERVATION" | "LOTTERY" | "TRADE";
  paymentMethod: "CARD" | "EASY_PAY" | "VIRTUAL_ACCOUNT";
  domainId?: number; // RESERVATION | PRERESERVATION | TRADE에서 사용
  entryId?: string; // LOTTERY에서 사용 (UUID)
}

export interface PaymentResponse {
  paymentId: number;
  orderId: string;
  amount: number;
  status: string;
  paidAt: string;
}

class TypedPaymentApi {
  async pay(request: PaymentRequest): Promise<PaymentResponse> {
    const response = await typedApiClient.post<PaymentResponse>(
      "/api/payments/pay",
      request
    );
    return response;
  }
}

export const typedPaymentApi = new TypedPaymentApi();
