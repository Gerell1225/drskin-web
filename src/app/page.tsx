import Branches from "@/components/landing/Branches";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import HowTo from "@/components/landing/HowTo";
import Loyalty from "@/components/landing/Loyalty";
import Navbar from "@/components/landing/Navbar";
import Services from "@/components/landing/Services";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 text-gray-900">
      <Navbar />
      <Hero />
      <Services />
      <Branches />
      <HowTo />
      <Loyalty />
      <FAQ />
      <Footer />
    </div>
  );
}
