import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Instagram } from 'lucide-react';
import { Gallery as GalleryItem } from '@shared/schema';

const GallerySection = () => {
  const [openImage, setOpenImage] = useState<GalleryItem | null>(null);

  const { data: gallery = [], isLoading, error } = useQuery<GalleryItem[]>({
    queryKey: ['/api/gallery'],
  });

  const handleImageClick = (item: GalleryItem) => {
    setOpenImage(item);
  };

  const closeModal = () => {
    setOpenImage(null);
  };

  if (isLoading) {
    return (
      <section id="gallery" className="py-16 md:py-24 bg-[#1A1A1A]">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="font-bold text-3xl md:text-4xl mb-12">
            Event <span className="text-primary">Gallery</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="w-full h-60 bg-gray-800 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !gallery) {
    return (
      <section id="gallery" className="py-16 md:py-24 bg-[#1A1A1A]">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="font-bold text-3xl md:text-4xl mb-6">
            Event <span className="text-primary">Gallery</span>
          </h2>
          <div className="bg-dark p-6 rounded-sm">
            <h3 className="text-xl font-bold mb-2">Failed to load gallery</h3>
            <p className="text-gray-400 mb-4">Please try again later</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-16 md:py-24 bg-[#1A1A1A]">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center mb-12">
          <h2 className="font-bold text-3xl md:text-4xl">
            Event <span className="text-primary">Gallery</span>
          </h2>
          <a 
            href="https://www.instagram.com/fullfuel.tv/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:text-primary/80 font-medium flex items-center gap-2 transition-colors"
          >
            Follow on Instagram <Instagram className="h-4 w-4" />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.slice(0, 8).map((item) => (
            <div 
              key={item.id} 
              className="overflow-hidden group cursor-pointer relative"
              onClick={() => handleImageClick(item)}
            >
              <img 
                src={item.imageUrl.startsWith('http') ? item.imageUrl : `/images/${item.imageUrl}`}
                alt={item.caption || 'Gallery image'} 
                className="w-full h-60 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Instagram className="text-white h-10 w-10" />
              </div>
            </div>
          ))}
        </div>

        {/* Image Modal */}
        {openImage && (
          <div 
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <div 
              className="max-w-4xl max-h-90vh relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute -top-10 right-0 text-white hover:text-primary"
                onClick={closeModal}
              >
                Close
              </button>
              <img 
                src={openImage.imageUrl.startsWith('http') ? openImage.imageUrl : `/images/${openImage.imageUrl}`}
                alt={openImage.caption || 'Gallery image'} 
                className="max-w-full max-h-[80vh]"
              />
              {openImage.caption && (
                <div className="mt-4">
                  <p className="text-white">{openImage.caption}</p>
                  <p className="text-sm text-gray-300">
                    {new Date(openImage.publishedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
              {openImage.instagramUrl && (
                <a 
                  href={openImage.instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center text-primary hover:underline"
                >
                  View on Instagram <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;
