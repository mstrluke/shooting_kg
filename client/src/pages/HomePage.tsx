import HeroSlider from '../components/home/HeroSlider';
import CountdownSection from '../components/home/CountdownSection';
import AboutSection from '../components/home/AboutSection';
import NewsSection from '../components/home/NewsSection';
import EventsSection from '../components/home/EventsSection';
import PhotoSection from '../components/home/PhotoSection';
import VideoSection from '../components/home/VideoSection';
import PartnersSection from '../components/home/PartnersSection';

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <CountdownSection />
      <AboutSection />
      <NewsSection />
      <EventsSection />
      <PhotoSection />
      <VideoSection />
      <PartnersSection />
    </>
  );
}
