import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServiceSection';
import BranchesSection from '@/components/BranchesSection';
import Footer from '@/components/Footer';
import OnlineBookingSection from '@/components/OnlineBookingSection';

export default function HomePage() {
  return (
    <main>
      <Header />
      <HeroSection />
      <ServicesSection />
      <BranchesSection />
      <OnlineBookingSection />
      <Footer />
    </main>
  );
}
