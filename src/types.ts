export interface UserFormData {
  businessName: string;   // १. नाव / व्यवसायाचे नाव
  proprietorName: string; // २. प्रोप्रायटर / हुद्दा
  address: string;        // ३. पत्ता / इतर माहिती
  mobileNumber: string;   // ४. मोबाईल नंबर
  photoUrl?: string;
  photoFile?: File | null;
}

export interface FormErrors {
  businessName?: string;
  proprietorName?: string;
  address?: string;
  mobileNumber?: string;
  photo?: string;
}

export interface RazorpayOrderResponse {
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  isTestMode?: boolean;
  message?: string;
}

export interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  formData: Omit<UserFormData, 'photoFile'>;
}

export type PolicyType = 'privacy' | 'terms' | 'refund' | 'disclaimer' | null;
