import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, Clock } from 'lucide-react';
import { Mix } from '@shared/schema';

const MusicSection = () => {
  const [activeMix, setActiveMix] = useState<number | null>(null);
  
  const { data: featuredMix, isLoading: featuredLoading } = useQuery({
    queryKey: ['/api/mixes/featured?limit=1'],
  });
  
  const { data: mixes, isLoading: mixesLoading } = useQuery({
    queryKey: ['/api/mixes'],
  });
  
  const handlePlayClick = (id: number) => {
    setActiveMix(id === activeMix ? null : id);
  };
  
  if (featuredLoading || mixesLoading) {
    return (
      <section id="music" className="py-16 md:py-24 bg-dark">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="font-bold text-3xl md:text-4xl mb-12">
            Latest <span className="text-primary">Mixes</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="animate-pulse">
              <div className="w-full h-80 bg-gray-800 mb-6"></div>
              <div className="h-6 bg-gray-800 mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-800 w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-800 w-40"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="p-3 bg-[#1A1A1A] animate-pulse">
                  <div className="h-4 bg-gray-800 w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-800 w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  if (!featuredMix || !mixes || featuredMix.length === 0 || mixes.length === 0) {
    return (
      <section id="music" className="py-16 md:py-24 bg-dark">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="font-bold text-3xl md:text-4xl mb-6">
            Latest <span className="text-primary">Mixes</span>
          </h2>
          <div className="bg-[#1A1A1A] p-6 rounded-sm">
            <h3 className="text-xl font-bold mb-2">Failed to load music</h3>
            <p className="text-gray-400 mb-4">Please try again later</p>
          </div>
        </div>
      </section>
    );
  }
  
  const featured = featuredMix[0];
  const playlistItems = mixes.slice(0, 5);
  
  return (
    <section id="music" className="py-16 md:py-24 bg-dark">
      <div className="container mx-auto px-6 md:px-12">
        <h2 className="font-bold text-3xl md:text-4xl mb-12">
          Latest <span className="text-primary">Mixes</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Featured Mix */}
          <div className="featured-mix">
            <div className="mb-6 relative group">
              <img 
                src={featured.imageUrl || `https://images.unsplash.com/photo-1583331530804-9b2fa2cdfbb9`}
                alt={featured.title} 
                className="w-full h-80 object-cover rounded-sm"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-20 h-20 rounded-full bg-primary flex items-center justify-center transition-transform duration-300 hover:scale-110 cursor-pointer"
                  onClick={() => handlePlayClick(featured.id)}
                >
                  <Play className="text-dark text-2xl pl-1" />
                </div>
              </div>
              
              {activeMix === featured.id && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${featured.youtubeId}?autoplay=1`}
                    title={featured.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
            <h3 className="font-bold text-2xl mb-2">{featured.title}</h3>
            <p className="text-gray-400 mb-4">{featured.description}</p>
            <div className="flex items-center">
              {featured.imageUrl && (
                <img 
                  src={featured.imageUrl}
                  alt={`${featured.artist} Profile`} 
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
              )}
              <div>
                <p className="font-medium">{featured.artist}</p>
                <p className="text-sm text-gray-400">
                  {new Date(featured.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
          
          {/* Playlist */}
          <div className="playlist space-y-4">
            {playlistItems.map((mix: Mix) => (
              <div 
                key={mix.id} 
                className={`flex items-center p-3 ${activeMix === mix.id ? 'bg-primary bg-opacity-20' : 'hover:bg-[#1A1A1A]'} transition-colors cursor-pointer`}
                onClick={() => handlePlayClick(mix.id)}
              >
                <div className="w-10 h-10 flex items-center justify-center mr-4">
                  <Play className={`${activeMix === mix.id ? 'text-primary' : 'text-white'}`} />
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium">{mix.title}</h4>
                  <p className="text-sm text-gray-400">{mix.artist}</p>
                </div>
                <div className="text-right flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-primary" />
                  <span className="font-mono text-sm">{mix.duration}</span>
                </div>
                
                {activeMix === mix.id && (
                  <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <div className="w-full max-w-3xl relative">
                      <button 
                        className="absolute -top-10 right-0 text-white hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMix(null);
                        }}
                      >
                        Close
                      </button>
                      <iframe
                        width="100%"
                        height="480"
                        src={`https://www.youtube.com/embed/${mix.youtubeId}?autoplay=1`}
                        title={mix.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MusicSection;
