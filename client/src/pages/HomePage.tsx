import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import FeaturedVideos from '@/components/FeaturedVideos';
import EventsSection from '@/components/EventsSection';
import MusicSection from '@/components/MusicSection';
import GallerySection from '@/components/GallerySection';
import AboutSection from '@/components/AboutSection';
import LiveNowButton from '@/components/LiveNowButton';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Full Fuel TV | Electronic Music, Videos & Events</title>
        <meta name="description" content="Full Fuel TV explores electronic music through the best live sets & DJ mixes from around the world." />
      </Helmet>
      <Header />
      <main>
        <HeroSection />
        <FeaturedVideos />
        <EventsSection />
        <MusicSection />
        <GallerySection />
        <AboutSection />
      </main>
      <LiveNowButton />
      <Footer />
    </>
  );
};

export default HomePage;
