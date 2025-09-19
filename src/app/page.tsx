"use client";

import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import BranchList from "@/components/BranchList";

const Header = dynamic(() => import("@/components/Header"), { ssr: false });

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <BranchList />
      <Footer />
    </>
  );
}
