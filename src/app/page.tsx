"use client";

import { Navbar } from "@/components/home/navbar";
import { Hero } from "@/components/home/hero";
import { ChaosOrder } from "@/components/home/chaos-order";
import { Features } from "@/components/home/features";
import { AiSection } from "@/components/home/ai-section";
import { Pricing } from "@/components/home/pricing";
import { CtaSection } from "@/components/home/cta-section";
import { Footer } from "@/components/home/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="fixed inset-0 grid-bg opacity-60 pointer-events-none z-0" />
      <div className="animate-drift fixed -top-24 -left-24 w-125 h-125 rounded-full bg-red-500/15 blur-3xl pointer-events-none" />
      <div className="animate-drift-slow fixed top-150 -right-48 w-150 h-150 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />
      <main className="relative z-10">
        <Hero />
        <ChaosOrder />
        <section id="features">
          <Features />
        </section>
        <section id="ai">
          <AiSection />
        </section>
        <section id="pricing">
          <Pricing />
        </section>
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
