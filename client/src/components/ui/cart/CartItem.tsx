import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, CartItem as CartItemType } from '@/contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  // Add defaults for all properties to prevent undefined errors
  const { 
    id = '',
    name = 'Product', 
    price = 0, 
    imageUrl = '',
    quantity = 1,
    product
  } = item || {};
  const { updateQuantity, removeFromCart } = useCart();

  // Use product.imageUrl as a backup if imageUrl is not available
  const displayImageUrl = imageUrl || (product?.imageUrl || '');

  return (
    <div className="flex items-center py-4 border-b">
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <img
          src={displayImageUrl ? (displayImageUrl.startsWith('/') ? displayImageUrl : `/images/products/${displayImageUrl}`) : '/images/products/placeholder.jpg'}
          alt={name || 'Product'}
          className="h-full w-full object-cover object-center"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg';
          }}
        />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div className="flex justify-between text-base font-medium">
          <h3>{name || 'Product'}</h3>
          <p className="ml-4">${price ? price.toFixed(2) : '0.00'}</p>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border rounded-md">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => updateQuantity(id, quantity - 1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="px-2">{quantity}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => updateQuantity(id, quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <Button
            variant="ghost" 
            size="icon" 
            className="text-red-500 hover:text-red-700"
            onClick={() => removeFromCart(id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}