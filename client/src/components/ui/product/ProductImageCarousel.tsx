import React, { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
  isLocalPath?: boolean;
}

interface ProductImageCarouselProps {
  images: ProductImage[];
  fallbackImage?: string; // For backward compatibility
}

export const ProductImageCarousel = ({ images, fallbackImage }: ProductImageCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, skipSnaps: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // Prepare images array, handling the fallback case
  const allImages = React.useMemo(() => {
    if (images && images.length > 0) {
      return images;
    } else if (fallbackImage) {
      // Check if the fallback image is a local path
      const isLocalPath = !fallbackImage.startsWith('http') && !fallbackImage.startsWith('data:');
      if (isLocalPath && !fallbackImage.includes('/images/products/')) {
        // If it's a local image filename, use it directly
        return [{ url: fallbackImage, isPrimary: true, isLocalPath: true }];
      } else {
        // Otherwise use it as a URL
        return [{ url: fallbackImage, isPrimary: true, isLocalPath: false }];
      }
    }
    return [];
  }, [images, fallbackImage]);

  // Find primary image for initial slide
  useEffect(() => {
    const primaryIndex = allImages.findIndex(img => img.isPrimary);
    if (primaryIndex >= 0 && emblaApi) {
      emblaApi.scrollTo(primaryIndex);
    }
  }, [emblaApi, allImages]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Initialize carousel
  useEffect(() => {
    if (emblaApi) {
      setScrollSnaps(emblaApi.scrollSnapList());
      emblaApi.on('select', onSelect);
      return () => {
        emblaApi.off('select', onSelect);
      };
    }
  }, [emblaApi, onSelect]);

  // If no images, show a placeholder
  if (allImages.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-md">
        <p className="text-gray-400">No image available</p>
      </div>
    );
  }

  // If only one image, don't show carousel controls
  if (allImages.length === 1) {
    return (
      <div className="relative rounded-lg overflow-hidden">
        <img
          src={!allImages[0].url.startsWith('http') ? `/images/products/${allImages[0].url}` : allImages[0].url}
          alt={allImages[0].alt || "Product image"}
          className="w-full h-auto object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-lg" ref={emblaRef}>
        <div className="flex">
          {allImages.map((image, index) => (
            <div className="min-w-0 flex-grow-0 flex-shrink-0 w-full relative" key={index}>
              <img
                src={!image.url.startsWith('http') ? `/images/products/${image.url}` : image.url}
                alt={image.alt || `Product image ${index + 1}`}
                className="w-full h-auto object-contain aspect-square"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
        onClick={scrollPrev}
        aria-label="Previous image"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
        onClick={scrollNext}
        aria-label="Next image"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Thumbnails/dots navigation */}
      <div className="flex justify-center mt-4 gap-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              selectedIndex === index ? 'bg-primary' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductImageCarousel;