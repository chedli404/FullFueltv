import { useState, useEffect } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

// Load Stripe outside of component to avoid recreation on renders
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface ShopCheckoutProps {
  amount: number;
  products: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    variantId?: string;
  }[];
  onSuccess?: () => void;
  onClose?: () => void;
}

// Wrapper component to provide Stripe context
export function ShopCheckout(props: ShopCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Create a Payment Intent when the component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const productIds = props.products.map(p => ({
          id: p.id,
          variantId: p.variantId,
          quantity: p.quantity,
          price: p.price * 100 // Convert to cents
        }));

        const response = await apiRequest("/api/shop/create-payment-intent", {
          method: "POST",
          body: JSON.stringify({
            amount: props.amount * 100, // Convert to cents
            products: productIds,
            metadata: {
              productCount: props.products.length,
            }
          })
        });

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Error creating payment intent:", error);
      }
    };

    createPaymentIntent();
  }, [props.amount, props.products]);

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Complete Your Purchase</CardTitle>
          <CardDescription>
            Enter your payment information to complete your order.
          </CardDescription>
        </CardHeader>
        <CheckoutForm 
          amount={props.amount} 
          products={props.products} 
          onSuccess={props.onSuccess}
          onClose={props.onClose}
        />
      </Card>
    </Elements>
  );
}

// Actual checkout form inside Elements provider
function CheckoutForm({ 
  amount, 
  products, 
  onSuccess, 
  onClose 
}: ShopCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/shop/confirmation',
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentError(error.message || 'Payment failed. Please try again.');
        toast({
          title: "Payment Failed",
          description: error.message || 'An error occurred during payment.',
          variant: "destructive",
        });
      } else {
        // Payment succeeded!
        toast({
          title: "Payment Successful",
          description: "Thank you for your purchase!",
        });
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError('An unexpected error occurred. Please try again.');
      toast({
        title: "Payment Error",
        description: 'An unexpected error occurred. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Order Summary</h3>
          <div className="bg-gray-50 p-3 rounded-md">
            {products.map((product, index) => (
              <div key={index} className="flex justify-between text-sm py-1">
                <span>{product.name} × {product.quantity}</span>
                <span>${(product.price * product.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t mt-2 pt-2 font-medium flex justify-between">
              <span>Total</span>
              <span>${amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="py-2">
          <Label htmlFor="payment-element">Payment Information</Label>
          <div className="mt-1">
            <PaymentElement id="payment-element" />
          </div>
        </div>

        {paymentError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {paymentError}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isProcessing || !stripe || !elements}
        >
          {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </Button>
        {onClose && (
          <Button 
            type="button" 
            variant="outline" 
            className="w-full" 
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
        )}
      </CardFooter>
    </form>
  );
}