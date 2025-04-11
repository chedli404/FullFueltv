import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import VideoPlayer from './ui/player';
import { Video } from '@shared/schema';

const HeroSection = () => {
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null);
  
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['/api/videos/featured?limit=1'],
  });
  
  useEffect(() => {
    if (videos && videos.length > 0) {
      setFeaturedVideo(videos[0]);
    }
  }, [videos]);
  
  if (isLoading) {
    return (
      <section className="relative w-full h-screen overflow-hidden pt-16 bg-dark">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }
  
  if (error || !featuredVideo) {
    return (
      <section className="relative w-full h-screen overflow-hidden pt-16 bg-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Failed to load featured video</h2>
          <p className="text-gray-400 mb-6">Please try again later</p>
          <Link href="/videos">
            <a className="bg-primary hover:bg-opacity-80 text-dark px-6 py-3 rounded-sm font-medium transition-colors uppercase">
              Browse Videos
            </a>
          </Link>
        </div>
      </section>
    );
  }
  
  return (
    <section className="relative w-full h-screen overflow-hidden pt-16">
      <div className="absolute w-full h-full">
        <VideoPlayer 
          videoId={featuredVideo.youtubeId} 
          title={featuredVideo.title}
          autoplay={true}
          showControls={false}
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30 flex flex-col justify-end pb-12 md:pb-24 px-6 md:px-12">
        <div className="container mx-auto">
          <div className="inline-block bg-primary px-3 py-1 mb-4">
            <span className="font-mono text-dark text-sm uppercase font-bold">Live Now</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-4">{featuredVideo.title}</h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl">{featuredVideo.description}</p>
          <div className="flex space-x-4">
            <Link href={`/videos/${featuredVideo.id}`}>
              <a className="bg-primary hover:bg-opacity-80 text-dark px-6 py-3 rounded-sm font-medium transition-colors uppercase">
                Watch Now
              </a>
            </Link>
            <Link href="/events">
              <a className="bg-transparent border border-white hover:border-primary hover:text-primary text-white px-6 py-3 rounded-sm font-medium transition-colors uppercase">
                View Schedule
              </a>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
