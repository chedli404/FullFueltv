import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Instagram, X, Calendar } from 'lucide-react';
import { Gallery } from '@shared/schema';
import Header from '@/components/Header';
import Footer from '@/components/Footer';


const GalleryPage = () => {
  const [openImage, setOpenImage] = useState<Gallery | null>(null);

  const { data: gallery = [], isLoading, error } = useQuery<Gallery[]>({
    queryKey: ['/api/gallery'],
  });

  const handleImageClick = (item: Gallery) => {
    setOpenImage(item);
  };

  const closeModal = () => {
    setOpenImage(null);
  };
  return (
    <>
      <Helmet>
        <title>Gallery | Full Fuel TV</title>
        <meta name="description" content="View photos from the best electronic music events and festivals around the world." />
      </Helmet>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 bg-[#121212]">
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Event <span className="text-primary">Gallery</span>
                </h1>
                <p className="text-xl text-gray-300 max-w-3xl mb-12">
                  Browse through our collection of images from the best electronic music events from around the world.
                </p>
              </div>
              <a
                href="https://www.instagram.com/fullfuel.tv/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-primary hover:text-dark px-4 py-3 rounded-sm transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span>Follow on Instagram</span>
              </a>
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-12 bg-dark">
          <div className="container mx-auto px-6 md:px-12">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                  <div key={i} className="bg-[#1A1A1A] h-60 animate-pulse"></div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-[#1A1A1A] p-6 rounded-sm">
                <h3 className="text-xl font-bold mb-2">Failed to load gallery</h3>
                <p className="text-gray-400 mb-4">Please try again later</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.map((item) => (
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
                      {item.caption && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-sm font-medium">{item.caption}</p>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </section>

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
                className="absolute -top-12 right-0 text-white hover:text-primary flex items-center gap-2"
                onClick={closeModal}
              >
                Close <X className="h-5 w-5" />
              </button>
              <img
                src={openImage.imageUrl.startsWith('http') ? openImage.imageUrl : `/images/${openImage.imageUrl}`}
                alt={openImage.caption || 'Gallery image'}
                className="max-w-full max-h-[80vh]"
              />
              {(openImage.caption || openImage.publishedAt) && (
                <div className="mt-4">
                  {openImage.caption && (
                    <p className="text-white text-lg">{openImage.caption}</p>
                  )}
                  {openImage.publishedAt && (
                    <div className="flex items-center mt-2 gap-2 text-sm text-gray-300">
                      <Calendar className="h-4 w-4 text-primary" />
                      <p>
                        {new Date(openImage.publishedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
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
      </main>
      <Footer />
    </>
  );
};

export default GalleryPage;
