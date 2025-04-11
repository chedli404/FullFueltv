import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { CheckCircle } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const [, setLocation] = useLocation();
  const { clearCart } = useCart();
  
  // Make sure cart is cleared on successful checkout
  useEffect(() => {
    clearCart();
  }, [clearCart]);
  
  return (
    <div className="container max-w-md py-16">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold">Order Successful!</h1>
        
        <p className="text-muted-foreground">
          Thank you for your purchase! We've received your order and will process it right away.
        </p>
        
        <div className="pt-6 space-y-4">
          <Button 
            className="w-full"
            onClick={() => setLocation('/shop')}
          >
            Continue Shopping
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setLocation('/profile')}
          >
            View My Orders
          </Button>
        </div>
      </div>
    </div>
  );
}