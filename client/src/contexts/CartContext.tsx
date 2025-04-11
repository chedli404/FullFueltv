import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@shared/schema';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  product: Product;
  variantId?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse saved cart:', error);
      }
    }
  }, []);

  // Update localStorage and cart totals whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Calculate total and count
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    
    setCartTotal(total);
    setCartCount(count);
  }, [cart]);

  const addToCart = (product: Product, quantity: number) => {
    if (!product || !product._id) {
      console.error("Invalid product data", product);
      return;
    }
    
    setCart(prevCart => {
      // Check if the product is already in the cart
      const existingItemIndex = prevCart.findIndex(item => 
        item.product && item.product._id === product._id
      );
      
      if (existingItemIndex !== -1) {
        // Update quantity if product already in cart
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        // Add new item to cart
        return [
          ...prevCart,
          { 
            id: `${product._id}-${Date.now()}`, // Generate a unique ID for each cart item
            name: product.name, 
            price: product.price, 
            quantity, 
            imageUrl: product.imageUrl, 
            product 
          }
        ];
      }
    });
    
    // Open cart drawer when adding items
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartProvider;