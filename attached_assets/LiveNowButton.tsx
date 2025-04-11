import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';

const LiveNowButton = () => {
  const [isLive, setIsLive] = useState(false);
  
  const { data: featuredVideos } = useQuery({
    queryKey: ['/api/videos/featured?limit=1'],
  });
  
  useEffect(() => {
    // Check if there's featured content marked as "live"
    // For the MVP, we're just showing it for demo purposes
    if (featuredVideos && featuredVideos.length > 0) {
      setIsLive(true);
    }
  }, [featuredVideos]);
  
  if (!isLive) return null;
  
  return (
    <div className="fixed bottom-8 right-8 z-40">
      <Link href={featuredVideos && featuredVideos.length > 0 ? `/videos/${featuredVideos[0].id}` : '/videos'}>
        <a className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-dark px-4 py-3 rounded-full font-medium transition-colors shadow-lg">
          <span className="w-3 h-3 bg-dark rounded-full animate-pulse"></span>
          <span className="uppercase font-bold text-sm">Live Now</span>
        </a>
      </Link>
    </div>
  );
};

export default LiveNowButton;
