import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, PlayCircle, Clock } from 'lucide-react';
import { Video } from '@shared/schema';

const FeaturedVideos = () => {
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['/api/videos/featured?limit=3'],
  });
  
  if (isLoading) {
    return (
      <section id="videos" className="py-16 md:py-24 bg-dark">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="font-bold text-3xl md:text-4xl mb-12">
            Featured <span className="text-primary">Videos</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#1A1A1A] rounded-sm p-4 animate-pulse">
                <div className="w-full h-56 bg-gray-800 mb-4"></div>
                <div className="h-6 bg-gray-800 mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-800 w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (error || !videos) {
    return (
      <section id="videos" className="py-16 md:py-24 bg-dark">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="font-bold text-3xl md:text-4xl mb-6">
            Featured <span className="text-primary">Videos</span>
          </h2>
          <div className="bg-[#1A1A1A] p-6 rounded-sm">
            <h3 className="text-xl font-bold mb-2">Failed to load videos</h3>
            <p className="text-gray-400 mb-4">Please try again later</p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section id="videos" className="py-16 md:py-24 bg-dark">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center mb-12">
          <h2 className="font-bold text-3xl md:text-4xl">
            Featured <span className="text-primary">Videos</span>
          </h2>
          <Link href="/videos">
            <a className="text-primary hover:text-primary/80 font-medium flex items-center gap-2 transition-colors">
              View All <ExternalLink className="h-4 w-4" />
            </a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video: Video) => (
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedVideos;
