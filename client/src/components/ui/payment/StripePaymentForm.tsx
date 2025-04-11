import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Load Stripe outside of component to avoid recreating it
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentFormProps {
  amount: number;
  metadata: Record<string, string>;
  eventId: string;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

// The actual form inside the Elements provider
function CheckoutForm({ amount, metadata, eventId, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: 'Payment Failed',
          description: error.message || 'An error occurred during payment processing.',
          variant: 'destructive',
        });
        onError(new Error(error.message || 'Payment failed'));
      } else {
        toast({
          title: 'Payment Successful',
          description: 'Your ticket purchase was successful!',
        });
        onSuccess();
      }
    } catch (err: any) {
      toast({
        title: 'Payment Failed',
        description: err.message || 'An error occurred during payment processing.',
        variant: 'destructive',
      });
      onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full mt-4" 
        disabled={isLoading || !stripe || !elements}
      >
        {isLoading ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
      </Button>
    </form>
  );
}

export function StripePaymentForm({ amount, metadata, eventId, onSuccess, onError }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    // Create PaymentIntent as soon as the component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await apiRequest('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            eventId,
            metadata,
          }),
        });

        const data = await response.json();
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          toast({
            title: 'Error',
            description: data.message || 'Could not create payment intent.',
            variant: 'destructive',
          });
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Could not create payment intent.',
          variant: 'destructive',
        });
        onError(error);
      }
    };

    createPaymentIntent();
  }, [amount, eventId, metadata, toast, onError]);

  return (
    <div className="w-full">
      {clientSecret ? (
        <Elements 
          stripe={stripePromise} 
          options={{ 
            clientSecret,
            appearance: { 
              theme: 'stripe',
              variables: {
                colorPrimary: '#8b5cf6',
                colorBackground: '#ffffff',
                colorText: '#1f2937',
              }
            }
          }}
        >
          <CheckoutForm 
            amount={amount} 
            metadata={metadata} 
            eventId={eventId} 
            onSuccess={onSuccess} 
            onError={onError} 
          />
        </Elements>
      ) : (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="ml-2">Loading payment form...</span>
        </div>
      )}
    </div>
  );
}