import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CartIconProps {
  className?: string;
}

export function CartIcon({ className }: CartIconProps) {
  const { setIsCartOpen, cartCount } = useCart();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className={cn("relative", className)} 
      onClick={() => setIsCartOpen(true)}
      aria-label="Open shopping cart"
    >
      <ShoppingCart className="h-5 w-5" />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </Button>
  );
}