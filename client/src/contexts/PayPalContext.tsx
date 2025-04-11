import { createContext, useContext, ReactNode } from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

type PayPalContextProps = {
  children: ReactNode;
};

const PayPalContext = createContext<null>(null);

export const usePayPal = () => {
  const context = useContext(PayPalContext);
  if (context === undefined) {
    throw new Error('usePayPal must be used within a PayPalProvider');
  }
  return context;
};

export const PayPalProvider = ({ children }: PayPalContextProps) => {
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  const initialOptions = {
    clientId: paypalClientId || "test", // Fallback to prevent errors during development
    currency: "USD",
    intent: "capture"
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalContext.Provider value={null}>
        {children}
      </PayPalContext.Provider>
    </PayPalScriptProvider>
  );
};