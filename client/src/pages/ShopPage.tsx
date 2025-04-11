import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';

type ProductCategory = 'all' | 'clothing' | 'audio' | 'vinyl' | 'accessories' | 'other';

interface ProductVariant {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  images: { url: string; alt?: string; isPrimary: boolean }[]; // Added images property
  attributes: Record<string, string>;
  inStock: boolean;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: 'clothing' | 'audio' | 'vinyl' | 'accessories' | 'other';
  inStock: boolean;
  featured: boolean;
  variants: ProductVariant[];
  createdAt: string;
  images: { url: string; alt?: string; isPrimary: boolean }[]; // Added images property
}

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const { data: products, isLoading, error } = useQuery<Product[]>({ 
    queryKey: ['/api/shop/products'],
    staleTime: 60000 // 1 minute
  });
  
  // Filter products by category if one is selected
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products?.filter(product => product.category === selectedCategory);
  
  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category as ProductCategory);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-xl font-bold mb-4">Failed to load products</h2>
          <p className="text-gray-500 mb-4">There was an error loading the shop products.</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Full Fuel Shop</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Browse our exclusive collection of merchandise and accessories for electronic music lovers.
          From artist-designed apparel to premium audio gear, find everything you need for your next event.
        </p>
      </div>
      <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setLocation('/')}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-4 h-4"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back to Home
                </Button>
      
      <Tabs defaultValue="all" onValueChange={handleCategoryChange} className="w-full mb-8">
        <div className="flex justify-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="clothing">Clothing</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="vinyl">Vinyl</TabsTrigger>
            <TabsTrigger value="accessories">Accessories</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts?.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="clothing" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts?.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="audio" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts?.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="vinyl" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts?.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="accessories" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts?.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {filteredProducts?.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-gray-500">There are no products available in this category at the moment.</p>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="aspect-square overflow-hidden relative">
        <img 
          src={product.imageUrl.startsWith('/') ? product.imageUrl : `/images/products/${product.imageUrl}`} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/products/';
          }}
        />
        {product.featured && (
          <Badge className="absolute top-2 right-2">Featured</Badge>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Out of Stock</span>
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
          <Badge variant="outline">{product.category}</Badge>
        </div>
        {product.variants && product.variants.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">{product.variants.length} variants available</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="w-full grid grid-cols-2 gap-2">
          <Link href={`/shop/${product._id}`}>
            <Button variant="outline" className="w-full">View Details</Button>
          </Link>
          <Button 
            className="w-full"
            disabled={!product.inStock}
            onClick={() => {
              if (product.variants && product.variants.length > 0) {
                toast({
                  title: "Please select options",
                  description: "This product has multiple variants. Please view details to select.",
                });
              } else {
                // Add product to cart
                addToCart({...product, createdAt: new Date()}, 1);
                
                toast({
                  title: "Added to cart",
                  description: `${product.name} has been added to your cart.`,
                });
              }
            }}
          >
            {product.variants && (product.variants.length > 0 ? 'Choose Options' : 'Add to Cart')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}