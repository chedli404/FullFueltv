import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import VideoPlayer from './HeroSection/player';
import { Video } from '@shared/schema';

import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const HeroSection = () => {
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null);
  const [playing, setPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

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
    <section className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <VideoPlayer 
          videoId={featuredVideo.youtubeId} 
          title={featuredVideo.title}
          autoplay={playing}
          controls={false}
          muted={isMuted}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
          <button 
            onClick={() => setPlaying(!playing)} 
            className="w-10 h-10 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-primary hover:text-black transition-colors"
          >
            {playing ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-primary hover:text-black transition-colors"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
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