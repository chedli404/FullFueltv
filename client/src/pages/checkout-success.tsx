import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { CheckCircle } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const [, navigate] = useLocation();
  const { clearCart } = useCart();

  // Clear the cart when payment is successful
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="container max-w-2xl py-12">
      <Card className="border-green-200">
        <CardHeader className="pb-2">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center text-2xl">Payment Successful!</CardTitle>
          <CardDescription className="text-center">
            Thank you for your purchase
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-2">
          <p className="mb-4">
            Your payment has been processed successfully. 
            You will receive a confirmation email with your order details shortly.
          </p>
          <p className="text-muted-foreground">
            Order ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-6">
          <Button 
            className="w-full" 
            onClick={() => navigate('/shop')}
          >
            Continue Shopping
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}