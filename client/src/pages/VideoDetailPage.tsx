import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Share2, ThumbsUp, MessageCircle, Calendar, Tag } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VideoPlayer from '@/components/HeroSection/player';
import { Video } from '@shared/schema';

const VideoDetailPage = () => {
  const [match, params] = useRoute('/videos/:id');
  const videoId = params?.id;
  
  const { data: video, isLoading, error } = useQuery({
    queryKey: [`/api/videos/${videoId}`],
    enabled: !!videoId,
  });
  
  const { data: relatedVideos } = useQuery({
    queryKey: ['/api/videos'],
  });
  
  // Filter out current video and get 3 related videos
  const filteredRelatedVideos = relatedVideos 
    ? relatedVideos
        .filter((v: Video) => v.id !== videoId)
        .slice(0, 3)
    : [];
  
  if (isLoading) {
    return (
      <>
        <Header />
        <main className="pt-20 pb-12 bg-dark min-h-screen">
          <div className="container mx-auto px-6 md:px-12">
            <div className="w-full h-[60vh] bg-[#1A1A1A] animate-pulse mb-8"></div>
            <div className="h-8 bg-[#1A1A1A] w-3/4 animate-pulse mb-4"></div>
            <div className="h-4 bg-[#1A1A1A] w-1/2 animate-pulse mb-8"></div>
            <div className="h-32 bg-[#1A1A1A] animate-pulse"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  if (error || !video) {
    return (
      <>
        <Header />
        <main className="pt-20 pb-12 bg-dark min-h-screen">
          <div className="container mx-auto px-6 md:px-12">
            <div className="bg-[#1A1A1A] p-6 rounded-sm">
              <h3 className="text-xl font-bold mb-2">Failed to load video</h3>
              <p className="text-gray-400 mb-4">Please try again later</p>
              <Link href="/videos">
                <a className="text-primary hover:underline">Back to videos</a>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{video.title} | Full Fuel TV</title>
        <meta name="description" content={video.description} />
      </Helmet>
      <Header />
      <main className="pt-20 pb-12 bg-dark">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-6">
            <Link href="/videos">
              <a className="inline-flex items-center text-gray-400 hover:text-primary">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to videos
              </a>
            </Link>
          </div>
          
          {/* Video Player */}
          <div className="w-full aspect-video bg-black mb-6">
            <VideoPlayer
              videoId={video.youtubeId}
              title={video.title}
              showControls={true}
              autoplay={true}
            />
          </div>
          
          {/* Video Info */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-3">{video.title}</h1>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400 mb-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-primary" />
                {new Date(video.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div>{video.views?.toLocaleString() || '0'} views</div>
              <div>Duration: {video.duration}</div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {video.tags && video.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-[#1A1A1A] text-sm rounded-sm"
                >
                  <Tag className="h-3 w-3 mr-1 text-primary" />
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex gap-4 mb-8">
              <button className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#252525] px-4 py-2 rounded-sm transition-colors">
                <ThumbsUp className="h-4 w-4 text-primary" />
                Like
              </button>
              <button className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#252525] px-4 py-2 rounded-sm transition-colors">
                <Share2 className="h-4 w-4 text-primary" />
                Share
              </button>
            </div>
            
            <div className="bg-[#1A1A1A] p-6 rounded-sm mb-8">
              <h2 className="font-bold text-xl mb-4">Description</h2>
              <p className="text-gray-300 whitespace-pre-line">{video.description}</p>
            </div>
          </div>
          
          {/* Related Videos */}
          {filteredRelatedVideos.length > 0 && (
            <div className="mt-12">
              <h2 className="font-bold text-2xl mb-6">Related Videos</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredRelatedVideos.map((relatedVideo: Video) => (
                  <div key={relatedVideo.id} className="group transition-all duration-300 hover:-translate-y-1">
                    <Link href={`/videos/${relatedVideo.id}`}>
                      <a>
                        <div className="relative overflow-hidden mb-4">
                          <img 
                            src={relatedVideo.thumbnailUrl || `https://i.ytimg.com/vi/${relatedVideo.youtubeId}/maxresdefault.jpg`}
                            alt={relatedVideo.title} 
                            className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <h3 className="font-bold group-hover:text-primary transition-colors">{relatedVideo.title}</h3>
                      </a>
                    </Link>
                    <p className="text-gray-400 text-sm mt-1">
                      {new Date(relatedVideo.publishedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default VideoDetailPage;
