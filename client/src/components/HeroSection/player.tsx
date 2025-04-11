
interface VideoPlayerProps {
  videoId: string;
  title: string;
  autoplay?: boolean;
  controls?: boolean;
  startAt?: number;
  muted?: boolean;
  className?: string;
}

const VideoPlayer = ({ 
  videoId, 
  title, 
  autoplay = false, 
  controls = true,
  startAt = 0,
  muted = true,
  className = ''
}: VideoPlayerProps) => {
  return (
    <div className={`relative w-full h-full ${className}`}>
      <div className="relative w-full h-0 pb-[56.25%] overflow-hidden">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}&controls=${controls ? 1 : 0}&modestbranding=1&showinfo=0&rel=0&start=${startAt}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
