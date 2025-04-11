import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { PlayCircle, Clock, Search, Filter } from 'lucide-react';
import { Video } from '@shared/schema';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';

const VideosPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['/api/videos'],
  });
  
  // Get unique tags from all videos
  const allTags = videos ? [...new Set(videos.flatMap((video: Video) => video.tags))] : [];
  
  // Filter videos based on search query and selected tag
  const filteredVideos = videos ? videos.filter((video: Video) => {
    const matchesSearch = searchQuery.trim() === '' || 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = selectedTag === null || video.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  }) : [];
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle tag selection
  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };
  
  return (
    <>
      <Helmet>
        <title>Videos | Full Fuel TV</title>
        <meta name="description" content="Explore the best electronic music videos, live sets and performances from around the world." />
      </Helmet>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 bg-[#121212]">
          <div className="container mx-auto px-6 md:px-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Video <span className="text-primary">Collection</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mb-12">
              Explore the best electronic music videos, live sets and performances from the top DJs and festivals around the world.
            </p>
            
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 border-gray-700 bg-[#1A1A1A] focus:border-primary"
                />
              </div>
            </div>
            
            {/* Tags */}
            {allTags.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center mb-2">
                  <Filter className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">Filter by tag:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`px-3 py-1 text-sm rounded-sm ${
                        selectedTag === tag 
                          ? 'bg-primary text-black' 
                          : 'bg-[#1A1A1A] hover:bg-primary hover:text-black text-white'
                      } transition-colors`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
        
        {/* Videos Grid */}
        <section className="py-12 bg-dark">
          <div className="container mx-auto px-6 md:px-12">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-[#1A1A1A] rounded-sm p-4 animate-pulse">
                    <div className="w-full h-56 bg-gray-800 mb-4"></div>
                    <div className="h-6 bg-gray-800 mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-800 w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-[#1A1A1A] p-6 rounded-sm">
                <h3 className="text-xl font-bold mb-2">Failed to load videos</h3>
                <p className="text-gray-400 mb-4">Please try again later</p>
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-bold mb-2">No videos found</h3>
                <p className="text-gray-400 mb-4">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredVideos.map((video: Video) => (
                  <div key={video.id} className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20">
                    <div className="relative overflow-hidden mb-4">
                      <img 
                        src={video.thumbnailUrl || `https://i.ytimg.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                        alt={video.title} 
                        className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-black bg-opacity-50 flex items-center justify-center transition-transform duration-300 hover:scale-110 cursor-pointer">
                          <PlayCircle className="text-primary h-10 w-10" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 px-2 py-1 flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-primary" />
                        <span className="font-mono text-xs">{video.duration}</span>
                      </div>
                    </div>
                    <Link href={`/videos/${video.id}`}>
                      <a>
                        <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{video.title}</h3>
                      </a>
                    </Link>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">{video.views?.toLocaleString() || '0'} views</span>
                      <span className="text-primary font-mono text-sm">
                        {new Date(video.publishedAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    {video.tags && video.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {video.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="px-2 py-1 bg-[#1A1A1A] text-xs rounded-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default VideosPage;
