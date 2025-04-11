import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from 'wouter';
import { PayPalButtons } from "@paypal/react-paypal-js";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/checkout-success',
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full"
      >
        {isLoading ? "Processing..." : "Complete Payment"}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const { cart, cartTotal } = useCart();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/shop');
      return;
    }

    // Create payment intent with metadata about the order
    const getPaymentIntent = async () => {
      try {
        // Prepare order metadata
        const metadata = {
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            variantId: item.variantId || null
          }))
        };

        // Convert total to cents for Stripe
        const amount = Math.round(cartTotal * 100);

        const response = await apiRequest("/api/create-payment-intent", {
          method: "POST",
          body: JSON.stringify({ amount, metadata })
        });

        setClientSecret(response.clientSecret);
      } catch (error: any) {
        console.error('Error creating payment intent:', error);
        toast({
          title: "Error",
          description: "Could not initiate checkout process. Please try again.",
          variant: "destructive",
        });
        navigate('/shop');
      }
    };

    getPaymentIntent();
  }, [cart, cartTotal, navigate, toast]);

  if (!clientSecret) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#6b46c1',
      },
    },
  };

  // Function for processing PayPal payment
  const createPayPalOrder = async () => {
    try {
      // Prepare order metadata
      const metadata = {
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variantId: item.variantId || null
        }))
      };

      // Call your server to create a PayPal order
      const response = await apiRequest("/api/create-paypal-order", {
        method: "POST",
        body: JSON.stringify({ 
          amount: cartTotal, 
          metadata 
        })
      });
      
      return response.id;
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      toast({
        title: "Error",
        description: "Could not create PayPal order. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const onPayPalApprove = async (data: { orderID: string }) => {
    try {
      // Call your server to capture the PayPal order
      const response = await apiRequest("/api/capture-paypal-order", {
        method: "POST",
        body: JSON.stringify({
          orderId: data.orderID
        })
      });

      // Handle success
      if (response.status === "COMPLETED") {
        navigate('/checkout-success');
      } else {
        toast({
          title: "Payment Not Completed",
          description: "Your payment was not completed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error capturing PayPal order:", error);
      toast({
        title: "Error",
        description: "Could not complete PayPal payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-2xl py-12">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Purchase</CardTitle>
          <CardDescription>
            Please choose your payment method to complete your order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stripe" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="stripe">Pay with Card</TabsTrigger>
              <TabsTrigger value="paypal">Pay with PayPal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stripe" className="mt-0">
              <Elements stripe={stripePromise} options={options}>
                <CheckoutForm />
              </Elements>
            </TabsContent>
            
            <TabsContent value="paypal" className="mt-0">
              <div className="py-4">
                <PayPalButtons
                  createOrder={createPayPalOrder}
                  onApprove={onPayPalApprove}
                  style={{
                    layout: 'vertical',
                    color: 'blue',
                    shape: 'rect',
                    label: 'pay',
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div>
            <p className="text-sm text-muted-foreground">Order Total:</p>
            <p className="text-lg font-semibold">${cartTotal.toFixed(2)}</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/shop')}>
            Return to Shop
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}