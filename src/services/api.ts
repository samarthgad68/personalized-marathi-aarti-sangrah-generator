import { UserFormData, RazorpayOrderResponse, PaymentVerificationRequest } from '../types';

export async function uploadPhoto(file: File): Promise<{ photoUrl: string; photoPath: string }> {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const contentType = (response.headers.get('content-type') || '').toLowerCase();

  if (!response.ok) {
    let errorMsg = 'फोटो अपलोड अयशस्वी झाला.';
    if (contentType.includes('application/json')) {
      const errData = await response.json().catch(() => ({}));
      errorMsg = errData.error || errorMsg;
    }
    throw new Error(errorMsg);
  }

  // Parse JSON response safely
  try {
    const data = await response.json();
    if (data && (data.photoUrl || data.success)) {
      return data;
    }
  } catch (err) {
    console.warn('Failed to parse upload photo JSON:', err);
  }

  if (contentType.includes('application/json')) {
    const data = await response.json().catch(() => null);
    if (data && data.photoUrl) return data;
  }

  throw new Error('फोटो अपलोड प्रतिसाद अयोग्य आहे.');
}

export async function createRazorpayOrder(): Promise<RazorpayOrderResponse> {
  const response = await fetch('/api/payment/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const contentType = (response.headers.get('content-type') || '').toLowerCase();

  if (!response.ok) {
    let errorMsg = 'पेमेंट ऑर्डर तयार करता आली नाही.';
    if (contentType.includes('application/json')) {
      const errData = await response.json().catch(() => ({}));
      errorMsg = errData.error || errorMsg;
    }
    throw new Error(errorMsg);
  }

  try {
    const data = await response.json();
    if (data && data.orderId) {
      return data;
    }
  } catch (err) {
    console.warn('Failed to parse order JSON:', err);
  }

  throw new Error('प्रतिसाद अयोग्य आहे.');
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

  const contentType = (response.headers.get('content-type') || '').toLowerCase();

  if (!response.ok) {
    let errorMsg = 'पेमेंट पडताळणीमध्ये त्रुटी आली.';
    if (contentType.includes('application/json')) {
      const errData = await response.json().catch(() => ({}));
      errorMsg = errData.error || errorMsg;
    }
    throw new Error(errorMsg);
  }

  try {
    const data = await response.json();
    if (data && data.sessionToken) {
      return data;
    }
  } catch (err) {
    console.warn('Failed to parse verify session JSON:', err);
  }

  throw new Error('प्रतिसाद अयोग्य आहे.');
}

async function resolvePhotoUrlForPayload(photoUrl?: string): Promise<string | undefined> {
  if (!photoUrl) return undefined;
  if (photoUrl.startsWith('blob:')) {
    try {
      const res = await fetch(photoUrl);
      const blob = await res.blob();
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(undefined as any);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn('Could not convert blob URL to base64:', e);
      return undefined;
    }
  }
  return photoUrl;
}

export async function generatePDFWithSession(
  sessionToken: string | null,
  formData: Omit<UserFormData, 'photoFile'>
): Promise<void> {
  const resolvedPhotoUrl = await resolvePhotoUrlForPayload(formData.photoUrl);
  const payloadFormData = { ...formData, photoUrl: resolvedPhotoUrl };

  const response = await fetch('/api/pdf/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionToken,
      formData: payloadFormData,
    }),
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    let errorMsg = 'PDF निर्मितीमध्ये त्रुटी आली.';
    if (contentType.includes('application/json')) {
      const errData = await response.json().catch(() => ({}));
      errorMsg = errData.error || errorMsg;
    }
    throw new Error(errorMsg);
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
    if (document.body.contains(a)) {
      document.body.removeChild(a);
    }
    window.URL.revokeObjectURL(url);
  }, 15000);
}

export async function verifyPaymentAndDownloadPDF(paymentData: PaymentVerificationRequest): Promise<void> {
  const resolvedPhotoUrl = await resolvePhotoUrlForPayload(paymentData.formData.photoUrl);
  const payloadFormData = { ...paymentData.formData, photoUrl: resolvedPhotoUrl };

  const response = await fetch('/api/payment/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...paymentData,
      formData: payloadFormData,
    }),
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    let errorMsg = 'PDF निर्मितीमध्ये त्रुटी आली.';
    if (contentType.includes('application/json')) {
      const errData = await response.json().catch(() => ({}));
      errorMsg = errData.error || errorMsg;
    }
    throw new Error(errorMsg);
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
    if (document.body.contains(a)) {
      document.body.removeChild(a);
    }
    window.URL.revokeObjectURL(url);
  }, 15000);
}
