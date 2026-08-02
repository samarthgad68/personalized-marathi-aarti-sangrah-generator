import { UserFormData, RazorpayOrderResponse, PaymentVerificationRequest } from '../types';

export async function uploadPhoto(file: File): Promise<{ photoUrl: string; photoPath: string }> {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'फोटो अपलोड अयशस्वी झाला.');
  }

  return response.json();
}

export async function createRazorpayOrder(): Promise<RazorpayOrderResponse> {
  const response = await fetch('/api/payment/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'पेमेंट ऑर्डर तयार करता आली नाही.');
  }

  return response.json();
}

export async function verifyPaymentSession(paymentDetails: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<{ success: boolean; sessionToken: string }> {
  const response = await fetch('/api/payment/verify-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentDetails),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'पेमेंट पडताळणीमध्ये त्रुटी आली.');
  }

  return response.json();
}

export async function generatePDFWithSession(
  sessionToken: string | null,
  formData: Omit<UserFormData, 'photoFile'>
): Promise<void> {
  const response = await fetch('/api/pdf/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionToken,
      formData,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'PDF निर्मितीमध्ये त्रुटी आली.');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `Personalized_Marathi_Aarti_Sangrah_${(formData.businessName || 'Aarti_Sangrah').replace(/\s+/g, '_')}.pdf`;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 100);
}

export async function verifyPaymentAndDownloadPDF(paymentData: PaymentVerificationRequest): Promise<void> {
  const response = await fetch('/api/payment/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'PDF निर्मितीमध्ये त्रुटी आली.');
  }

  // Handle PDF Blob Download directly in browser
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `Personalized_Marathi_Aarti_Sangrah_${(paymentData.formData.businessName || 'Aarti_Sangrah').replace(/\s+/g, '_')}.pdf`;
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 100);
}
