// Flutterwave Payment Integration Helper for Ticketa
declare global {
  interface Window {
    FlutterwaveCheckout?: (config: FlutterwaveCheckoutOptions) => void;
  }
}

export interface FlutterwaveCustomer {
  email: string;
  name: string;
  phone_number: string;
}

export interface FlutterwaveCustomizations {
  title: string;
  description: string;
  logo?: string;
}

export interface FlutterwaveCheckoutOptions {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer: FlutterwaveCustomer;
  customizations: FlutterwaveCustomizations;
  callback: (response: FlutterwaveResponse) => void;
  onclose: () => void;
}

export interface FlutterwaveResponse {
  amount: number;
  currency: string;
  customer: FlutterwaveCustomer;
  flw_ref: string;
  status: 'successful' | 'completed' | 'failed' | 'cancelled';
  transaction_id: number;
  tx_ref: string;
}

// Helper to dynamically load Flutterwave Checkout script (v3)
let scriptLoadingPromise: Promise<boolean> | null = null;

export const loadFlutterwaveScript = (): Promise<boolean> => {
  if (window.FlutterwaveCheckout) {
    return Promise.resolve(true);
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve) => {
    const existingScript = document.getElementById('flutterwave-js');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'flutterwave-js';
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return scriptLoadingPromise;
};

// Default Sandbox Test Key if user has not supplied VITE_FLUTTERWAVE_PUBLIC_KEY in .env
export const DEFAULT_FLUTTERWAVE_PUBLIC_KEY = 
  (import.meta as any).env?.VITE_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-SANDBOXDEMOKEY-X';

export interface TriggerFlutterwaveParams {
  amount: number;
  email: string;
  name: string;
  phone: string;
  eventTitle: string;
  currency?: string;
  publicKey?: string;
  paymentOptions?: string;
  onSuccess: (response: FlutterwaveResponse) => void;
  onClose?: () => void;
  onError?: (errMessage: string) => void;
}

export const triggerFlutterwavePayment = async (params: TriggerFlutterwaveParams): Promise<void> => {
  const isLoaded = await loadFlutterwaveScript();

  if (!isLoaded || !window.FlutterwaveCheckout) {
    if (params.onError) {
      params.onError('Unable to connect to Flutterwave checkout service. Please check network.');
    }
    return;
  }

  const txRef = `TIX-FLW-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const pubKey = params.publicKey || DEFAULT_FLUTTERWAVE_PUBLIC_KEY;

  window.FlutterwaveCheckout({
    public_key: pubKey,
    tx_ref: txRef,
    amount: params.amount,
    currency: params.currency || 'NGN',
    payment_options: params.paymentOptions || 'card, banktransfer, ussd, mobilemoney, account, qr',
    customer: {
      email: params.email,
      name: params.name,
      phone_number: params.phone,
    },
    customizations: {
      title: 'Ticketa Event Pass',
      description: `Payment for ${params.eventTitle}`,
      logo: 'https://flutterwave.com/images/logo-colored.svg',
    },
    callback: (response: FlutterwaveResponse) => {
      if (response.status === 'successful' || response.status === 'completed') {
        params.onSuccess(response);
      } else {
        if (params.onError) {
          params.onError(`Transaction status: ${response.status}`);
        }
      }
    },
    onclose: () => {
      if (params.onClose) {
        params.onClose();
      }
    },
  });
};
