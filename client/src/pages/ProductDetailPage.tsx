import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import ProductImageCarousel from '@/components/ui/product/ProductImageCarousel';

interface ProductImage {
  url: string;
  alt?: string;
  isPrimary: boolean;
}

interface ProductVariant {
  id: string;
  name: string;
  price?: number;
  imageUrl?: string;
  images: ProductImage[];
  attributes: Record<string, string>;
  inStock: boolean;
  
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  images: ProductImage[];
  category: 'clothing' | 'audio' | 'vinyl' | 'accessories' | 'other'; 
  inStock: boolean;
  featured: boolean;
  variants: ProductVariant[];
  createdAt: Date;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Enhanced data fetching with error handling
  const { 
    data: product, 
    isLoading, 
    error,
    refetch 
  } = useQuery<Product>({ 
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await fetch(`/api/shop/products/${id}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Product not found (${response.status})`
        );
      }

      const data = await response.json();

      // Auto-select first variant if exists
      if (data.variants?.length > 0) {
        setSelectedVariantId(data.variants[0].id);
      }

      return data;
    },
    staleTime: 60 * 1000,
    retry: false // Disable automatic retries
  });

  // Memoized derived state for better performance
  const { selectedVariant, displayPrice, isOutOfStock, attributeTypes, attributeValues } = useMemo(() => {
    const selectedVariant = product?.variants?.find(v => v.id === selectedVariantId) || null;
    const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
    const isOutOfStock = !!(!product?.inStock || (selectedVariant && !selectedVariant.inStock));

    // Get unique attribute types
    const attributeTypes = product?.variants?.length
    ? Array.from(new Set(product.variants.flatMap(v => Object.keys(v.attributes || {}))))
    : [];

    // Get unique attribute values for each type
    const attributeValues: Record<string, string[]> = {};
    attributeTypes.forEach(type => {
      const values = product?.variants
        ?.filter(v => v.attributes[type])
        .map(v => v.attributes[type]) || [];
      attributeValues[type] = Array.from(new Set(values));
    });

    return { selectedVariant, displayPrice, isOutOfStock, attributeTypes, attributeValues };
  }, [product, selectedVariantId]);

  // Handle quantity changes with validation
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setQuantity(1);
      return;
    }

    const newQuantity = parseInt(value, 10);
    if (!isNaN(newQuantity) && newQuantity > 0 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  // Get available variants for attribute selection
  const getAvailableVariantsForAttribute = (attrType: string, attrValue: string) => {
    if (!product?.variants) return [];

    const currentAttributes: Record<string, string> = {};

    attributeTypes.forEach(type => {
      if (type !== attrType && selectedVariant?.attributes[type]) {
        currentAttributes[type] = selectedVariant.attributes[type];
      }
    });

    currentAttributes[attrType] = attrValue;

    return product.variants.filter(variant => 
      Object.entries(currentAttributes).every(
        ([key, value]) => variant.attributes[key] === value
      )
    );
  };

    

  // Handle adding to cart with validation
  const handleAddToCart = () => {
    if (!product) return;

    if (product.variants && product.variants.length > 0 && !selectedVariantId) {
      toast({
        title: "Selection required",
        description: "Please select all available options",
        variant: "destructive"
      });
      return;
    }

    // Add the product to cart using the CartContext
    console.log('Adding to cart:', product, quantity);
    addToCart(product as any, quantity);
    
    toast({
      title: "Added to cart",
      description: `${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ''} × ${quantity}`,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/shop')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="w-full aspect-square rounded-lg" />
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-6 w-24" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            <div className="space-y-4 pt-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/shop')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
        </Button>

        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-bold">Product Unavailable</h2>
          <p className="text-gray-600 max-w-md">
            {error.message.includes('not found') 
              ? "The product you're looking for doesn't exist or may have been removed."
              : "We encountered an error loading this product. Please try again."}
          </p>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
            <Button variant="outline" onClick={() => refetch()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="container mx-auto py-10 px-4">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate('/shop')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image Carousel */}
        <div className="relative bg-gray-50 rounded-lg">
          {product && (
            <div className="relative">
              {/* Use our new carousel component */}
              <ProductImageCarousel 
                images={selectedVariant?.images?.length ? selectedVariant.images : (product.images?.length ? product.images : [])}
                fallbackImage={selectedVariant?.imageUrl || product.imageUrl}
              />
              
              {/* Badges and overlays */}
              {product.featured && (
                <Badge className="absolute top-4 right-4 z-10">Featured</Badge>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                  <span className="text-white font-semibold text-xl">Out of Stock</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product?.name}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline">{product?.category}</Badge>
              {product?.inStock ? (
                <Badge variant="outline" className="bg-green-100">In Stock</Badge>
              ) : (
                <Badge variant="outline" className="bg-red-100">Out of Stock</Badge>
              )}
            </div>

            <p className="text-2xl font-bold">${displayPrice.toFixed(2)}</p>
          </div>

          <p className="text-gray-700">{product?.description}</p>

          <Separator />

          {/* Variant Selection */}
          {product?.variants && product.variants.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Options</h3>

              {attributeTypes.map(attrType => (
                <div key={attrType} className="space-y-3">
                  <h4 className="text-md font-medium capitalize">{attrType}</h4>
                  <RadioGroup 
                    value={selectedVariant?.attributes[attrType] || ''}
                    onValueChange={(value) => {
                      const variants = getAvailableVariantsForAttribute(attrType, value);
                      if (variants.length > 0) {
                        setSelectedVariantId(variants[0].id);
                      }
                    }}
                  >
                    <div className="flex flex-wrap gap-3">
                      {attributeValues[attrType]?.map(value => {
                        const availableVariants = getAvailableVariantsForAttribute(attrType, value);
                        const isAvailable = availableVariants.length > 0;
                        const isSelected = selectedVariant?.attributes[attrType] === value;

                        return (
                          <div 
                            key={`${attrType}-${value}`} 
                            className={`flex items-center space-x-2 p-2 rounded-md ${
                              isSelected ? 'bg-gray-100' : ''
                            } ${
                              !isAvailable ? 'opacity-50' : 'cursor-pointer hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              if (isAvailable) {
                                const variants = getAvailableVariantsForAttribute(attrType, value);
                                if (variants.length > 0) {
                                  setSelectedVariantId(variants[0].id);
                                }
                              }
                            }}
                          >
                            <RadioGroupItem 
                              value={value} 
                              id={`${attrType}-${value}`}
                              disabled={!isAvailable}
                              className="hidden"
                            />
                            <Label 
                              htmlFor={`${attrType}-${value}`}
                              className={`capitalize ${
                                !isAvailable ? 'cursor-not-allowed' : 'cursor-pointer'
                              }`}
                            >
                              {value}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>
                </div>
              ))}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <Label htmlFor="quantity" className="text-md font-medium">Quantity</Label>
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="icon"
                disabled={quantity <= 1 || isOutOfStock}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={handleQuantityChange}
                disabled={isOutOfStock}
                className="w-16 text-center mx-2"
              />
              <Button 
                variant="outline" 
                size="icon"
                disabled={quantity >= 10 || isOutOfStock}
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
              >
                +
              </Button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button 
            className="w-full py-6 text-lg"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>

          {/* Shipping Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">Shipping & Returns</h3>
              <p className="text-sm text-gray-600">
                Free standard shipping on all orders. Processing time: 1-2 business days.
                Easy 30-day returns for unused items.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}