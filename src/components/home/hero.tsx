"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Checks } from "@phosphor-icons/react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur text-xs font-medium text-muted-foreground mb-7">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            The developer knowledge hub
          </div>

          <h1 className="font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6">
            Stop Losing Your
            <br />
            <span className="gradient-text">Developer Knowledge</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-9">
            Snippets scattered across Notion. Prompts buried in Slack. Commands
            lost in browser tabs. DevVault unifies everything you&apos;ve ever
            learned — searchable in milliseconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button className="group gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] transition-all">
                Start Free — It&apos;s Fast
                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <a href="#features">
              <Button
                variant="outline"
                className="gap-2 px-6 py-3 border-white/15 hover:border-white/30 text-white font-semibold rounded-xl"
              >
                <Play className="size-4" />
                See How It Works
              </Button>
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-muted-foreground text-sm">
          <span className="flex items-center gap-2">
            <Checks className="size-4 text-emerald-400" />
            No credit card required
          </span>
          <span className="flex items-center gap-2">
            <Checks className="size-4 text-emerald-400" />
            Free forever plan
          </span>
          <span className="flex items-center gap-2">
            <Checks className="size-4 text-emerald-400" />
            Export anytime
          </span>
        </div>
      </div>
    </section>
  );
}
