import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { cart, cartTotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Make sure user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login?redirect=/checkout');
    } else {
      setIsLoading(false); // Ensure loading state is updated after authentication check
    }
  }, [isAuthenticated, setLocation]);

  // Check if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      setLocation('/shop');
    } else {
      setIsLoading(false); // Ensure loading state is updated after cart check
    }
  }, [cart, setLocation]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
        <p>Preparing your checkout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => setLocation('/shop')}>Return to Shop</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-12">
      <Button 
        variant="outline" 
        className="mb-8"
        onClick={() => window.history.back()}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div>
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>
            <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID }}>
              <PayPalButtons
                style={{ layout: 'vertical' }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    intent: 'CAPTURE',
                    purchase_units: [
                      {
                        amount: {
                          currency_code: 'USD',
                          value: cartTotal.toFixed(2),
                        },
                      },
                    ],
                  });
                }}
                onApprove={(data, actions) => {
                  if (!actions?.order) {
                    console.error('PayPal order actions are undefined.');
                    setError('Payment failed. Please try again.');
                    return Promise.resolve();
                  }

                  return actions.order.capture().then(() => {
                    toast({
                      title: 'Payment successful!',
                      description: 'Your order has been placed successfully.',
                    });
                    clearCart();
                    setLocation('/checkout/success');
                  });
                }}
                onError={(err) => {
                  console.error('PayPal Checkout Error:', err);
                  setError('Payment failed. Please try again.');
                }}
              />
            </PayPalScriptProvider>
          </div>
        </div>

        <div className="lg:col-span-2 bg-muted p-6 rounded-lg h-fit">
          <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div key={item.product._id} className="flex justify-between">
                <div>
                  <span className="font-medium">{item.product.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">× {item.quantity}</span>
                </div>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}