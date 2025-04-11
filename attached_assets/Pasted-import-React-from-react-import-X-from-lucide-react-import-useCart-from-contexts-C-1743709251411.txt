import React from 'react';
import { X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { CartItem } from './CartItem';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { useLocation } from 'wouter';

export function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, cartTotal, clearCart } = useCart();
  const [_, setLocation] = useLocation();

  const handleCheckout = () => {
    setIsCartOpen(false);
    setLocation('/checkout');
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="flex flex-col w-full max-w-sm sm:max-w-md md:max-w-lg">
        <SheetHeader className="flex items-center justify-between border-b pb-4">
          <SheetTitle>Your Cart ({cart.length} items)</SheetTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => setIsCartOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setIsCartOpen(false);
                  setLocation('/shop');
                }}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <SheetFooter className="border-t pt-4">
            <div className="w-full space-y-4">
              <div className="flex justify-between text-base font-medium">
                <p>Subtotal</p>
                <p>${cartTotal.toFixed(2)}</p>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  className="w-full" 
                  onClick={handleCheckout}
                >
                  Checkout
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setIsCartOpen(false);
                    setLocation('/shop');
                  }}
                >
                  Continue Shopping
                </Button>
                
                <Button 
                  variant="link" 
                  className="w-full text-red-500"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}