import BookingForm from "@/components/landing/BookingForm";
import Branches from "@/components/landing/Branches";
import { Footer } from "@/components/landing/Footer";
import { HeaderDesktop, HeaderMobile } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import Rewards from "@/components/landing/Rewards";
import Services from "@/components/landing/Services";
import { Contact } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen text-[#0f0f0f] bg-[radial-gradient(1200px_600px_at_80%_-10%,#ffe6e6_0%,transparent_60%),radial-gradient(800px_400px_at_-10%_10%,#fff3f3_0%,transparent_50%)]">
      <HeaderDesktop />
      <HeaderMobile />
      <Hero />
      <Services />
      <Branches />
      <BookingForm />
      <Rewards />
      <Contact />
      <Footer />
    </div>
  );
}
