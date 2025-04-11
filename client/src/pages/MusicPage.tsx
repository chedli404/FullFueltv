import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { Play, Pause, Clock, Music, User, Calendar } from 'lucide-react';
import { Mix } from '@shared/schema';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const MusicPage = () => {
  const [activeMix, setActiveMix] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: mixes, isLoading, error } = useQuery({
    queryKey: ['/api/mixes'],
  });
  
  const handlePlayClick = (id: string) => {
    setActiveMix(activeMix === id ? null : id);
  };
  
  // Filter mixes based on search query
  const filteredMixes = mixes ? mixes.filter((mix: Mix) => {
    return mix.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mix.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mix.description.toLowerCase().includes(searchQuery.toLowerCase());
  }) : [];
  
  return (
    <>
      <Helmet>
        <title>Music | Full Fuel TV</title>
        <meta name="description" content="Stream the latest electronic music mixes and sets from top DJs around the world." />
      </Helmet>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 bg-[#121212]">
          <div className="container mx-auto px-6 md:px-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Latest <span className="text-primary">Mixes</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mb-12">
              Stream the latest electronic music mixes and sets from top DJs and producers around the world.
            </p>
            
            {/* Search */}
            <div className="relative max-w-md mb-8">
              <input
                type="text"
                placeholder="Search by title or artist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-sm px-4 py-3 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </section>
        
        {/* Mixes List */}
        <section className="py-12 bg-dark">
          <div className="container mx-auto px-6 md:px-12">
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="bg-[#1A1A1A] rounded-sm p-4 animate-pulse">
                    <div className="h-16 bg-gray-800"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-[#1A1A1A] p-6 rounded-sm">
                <h3 className="text-xl font-bold mb-2">Failed to load mixes</h3>
                <p className="text-gray-400 mb-4">Please try again later</p>
              </div>
            ) : filteredMixes.length === 0 ? (
              <div className="text-center py-12">
                <Music className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No mixes found</h3>
                <p className="text-gray-400 mb-4">Try adjusting your search query</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredMixes.map((mix: Mix) => (
                  <div 
                    key={mix.id} 
                    className={`flex flex-col md:flex-row gap-6 p-6 ${activeMix === mix.id ? 'bg-primary bg-opacity-10' : 'bg-[#1A1A1A]'} rounded-sm transition-colors`}
                  >
                    <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
                      <div className="relative group">
                        <img 
                          src={mix.imageUrl || `https://images.unsplash.com/photo-1583331530804-9b2fa2cdfbb9`}
                          alt={mix.title} 
                          className="w-full h-48 md:h-36 object-cover rounded-sm"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handlePlayClick(mix.id)}
                            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center"
                          >
                            {activeMix === mix.id ? (
                              <Pause className="text-dark" />
                            ) : (
                              <Play className="text-dark ml-1" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="font-bold text-xl mb-2">{mix.title}</h3>
                      <div className="flex flex-wrap gap-4 mb-3">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4 text-primary" />
                          <span className="text-gray-300">{mix.artist}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-gray-300">{mix.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="text-gray-300">
                            {new Date(mix.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-400 mb-4 line-clamp-2">{mix.description}</p>
                      <button 
                        onClick={() => handlePlayClick(mix.id)}
                        className={`px-4 py-2 rounded-sm ${activeMix === mix.id ? 'bg-primary text-dark' : 'bg-dark hover:bg-primary hover:text-dark'} transition-colors`}
                      >
                        {activeMix === mix.id ? 'Stop' : 'Play Mix'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* Active Mix Playback */}
        {activeMix && (
          <div className="fixed inset-x-0 bottom-0 bg-black bg-opacity-90 backdrop-blur-md border-t border-[#1A1A1A] p-4 z-40">
            <div className="container mx-auto px-6 md:px-12">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <button 
                  onClick={() => setActiveMix(null)}
                  className="p-2 bg-primary rounded-full"
                >
                  <Pause className="text-dark h-5 w-5" />
                </button>
                
                <div className="flex-grow">
                  <p className="font-bold">
                    {mixes?.find((mix: Mix) => mix.id === activeMix)?.title}
                  </p>
                  <p className="text-sm text-gray-400">
                    {mixes?.find((mix: Mix) => mix.id === activeMix)?.artist}
                  </p>
                </div>
                
                <iframe
                  className="hidden"
                  width="1"
                  height="1"
                  src={`https://www.youtube.com/embed/${mixes?.find((mix: Mix) => mix.id === activeMix)?.youtubeId}?autoplay=1`}
                  allow="autoplay"
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default MusicPage;
