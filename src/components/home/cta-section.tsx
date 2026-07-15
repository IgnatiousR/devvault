"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "@phosphor-icons/react";

export function CtaSection() {
  return (
    <section className="relative py-24 lg:py-32">
      {/*bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.25),transparent_50%)]*/}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-6">
          Ready to Organize
          <br />
          <span className="gradient-text">Your Knowledge?</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-9">
          Join 12,000+ developers who stopped losing their best code, prompts,
          and commands. Free to start — no card required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register">
            <Button className="group gap-2 px-7 py-3.5 bg-white text-black hover:bg-gray-200 font-semibold rounded-xl">
              Get Started Free
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
          <Button
            variant="outline"
            className="px-7 py-3.5 border-white/15 hover:border-white/30 text-white font-semibold rounded-xl"
          >
            Book a Demo
          </Button>
        </div>
        <div className="mt-8 text-xs text-muted-foreground font-mono">
          ⌘ + K to search · Works on web, macOS, Windows, Linux
        </div>
      </div>
    </section>
  );
}
