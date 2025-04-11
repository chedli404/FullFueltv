import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  showQuantity?: boolean;
}

export function AddToCartButton({ 
  product, 
  className = '', 
  showQuantity = false 
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(product, quantity);
    
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} added to your cart`,
    });
    setQuantity(1); // Reset quantity after adding to cart
  };

  const incrementQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showQuantity && (
        <div className="flex items-center border rounded-md">
          <Button 
            type="button"
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={decrementQuantity}
            disabled={quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="px-2">{quantity}</span>
          <Button 
            type="button"
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={incrementQuantity}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      )}

      <Button 
        className="flex items-center gap-2"
        onClick={handleAddToCart}
        type="button"
      >
        <ShoppingCart className="h-4 w-4" />
        <span>Add to Cart</span>
      </Button>
    </div>
  );
}