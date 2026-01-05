import { tokenManager } from "@/lib/auth/token";

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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.b2st.doncrytt.online";

class TypedPaymentApi {
  async pay(request: PaymentRequest): Promise<PaymentResponse> {
    const token = tokenManager.getAccessToken();

    const response = await fetch(`${API_BASE_URL}/api/payments/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "결제에 실패했습니다.");
    }

    const result = await response.json();
    return result.data;
  }
}

export const typedPaymentApi = new TypedPaymentApi();
