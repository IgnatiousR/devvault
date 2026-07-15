import { Checks, Star } from "@phosphor-icons/react";

const bullets = [
  {
    title: "Auto-generated tags",
    description:
      "AI assigns relevant tags based on content, language, and context.",
  },
  {
    title: "Smart descriptions",
    description:
      "Get a one-line summary of what each item does, in plain English.",
  },
  {
    title: "Related items",
    description:
      "Discover connections between snippets you'd never find manually.",
  },
  {
    title: "Natural language search",
    description:
      'Ask "that thing for debouncing" — get the right snippet instantly.',
  },
];

const tags = [
  { label: "react-hook", color: "#3b82f6" },
  { label: "authentication", color: "#f59e0b" },
  { label: "typescript", color: "#22c55e" },
  { label: "jwt", color: "#06b6d4" },
  { label: "session", color: "#ec4899" },
  { label: "localStorage", color: "#6366f1" },
];

const codeLines = [
  { num: 1, parts: [{ text: "import", color: "#c084fc" }, { text: " { useState, useEffect } ", color: "#e2e8f0" }, { text: "from", color: "#c084fc" }, { text: " 'react'", color: "#86efac" }] },
  { num: 2, parts: [] },
  { num: 3, parts: [{ text: "export function", color: "#c084fc" }, { text: " useAuth", color: "#60a5fa" }, { text: "() {", color: "#e2e8f0" }] },
  { num: 4, parts: [{ text: "  const", color: "#c084fc" }, { text: " [user, setUser] = ", color: "#e2e8f0" }, { text: "useState", color: "#60a5fa" }, { text: "(", color: "#e2e8f0" }, { text: "null", color: "#fbbf24" }, { text: ")", color: "#e2e8f0" }] },
  { num: 5, parts: [{ text: "  const", color: "#c084fc" }, { text: " token = localStorage.", color: "#e2e8f0" }, { text: "getItem", color: "#60a5fa" }, { text: "(", color: "#e2e8f0" }, { text: "'token'", color: "#86efac" }, { text: ")", color: "#e2e8f0" }] },
  { num: 6, parts: [] },
  { num: 7, parts: [{ text: "  ", color: "#e2e8f0" }, { text: "useEffect", color: "#60a5fa" }, { text: "(() => {", color: "#e2e8f0" }] },
  { num: 8, parts: [{ text: "    if", color: "#c084fc" }, { text: " (token) {", color: "#e2e8f0" }] },
  { num: 9, parts: [{ text: "      ", color: "#e2e8f0" }, { text: "fetchUser", color: "#60a5fa" }, { text: "(token).", color: "#e2e8f0" }, { text: "then", color: "#60a5fa" }, { text: "(setUser)", color: "#e2e8f0" }] },
  { num: 10, parts: [{ text: "    }", color: "#e2e8f0" }] },
  { num: 11, parts: [{ text: "  }, [])", color: "#e2e8f0" }] },
  { num: 12, parts: [] },
  { num: 13, parts: [{ text: "  return", color: "#c084fc" }, { text: " { user, ", color: "#e2e8f0" }, { text: "logout", color: "#60a5fa" }, { text: " }", color: "#e2e8f0" }] },
  { num: 14, parts: [{ text: "}", color: "#e2e8f0" }] },
];

export function AiSection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/5 text-xs font-semibold text-amber-400 mb-6">
              <Star className="size-3.5" />
              PRO FEATURE
            </div>

            <h2 className="font-bold text-4xl lg:text-5xl tracking-tight mb-5">
              AI that understands
              <br />
              <span className="gradient-text">your code</span>
            </h2>

            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Stop manually tagging things. DevVault&apos;s AI reads your
              snippets, prompts, and notes — then organizes them automatically.
              Just paste, and we&apos;ll handle the rest.
            </p>

            <ul className="space-y-4 mb-8">
              {bullets.map((bullet) => (
                <li key={bullet.title} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Checks className="size-3 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {bullet.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {bullet.description}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <a
              href="#pricing"
              className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 font-semibold text-sm group"
            >
              See Pro pricing
              <span className="group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </a>
          </div>

          <div>
            <div className="rounded-2xl border border-white/10 bg-[#0d0d16] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="ml-3 px-2.5 py-1 rounded-t-md bg-[#0d0d16] border-t border-x border-white/10 -mb-3 mt-1">
                  <span className="text-xs text-gray-300 font-mono flex items-center gap-1.5">
                    <Star className="size-3 text-amber-400" />
                    useAuth.ts
                  </span>
                </div>
              </div>

              <div className="p-4 font-mono text-[13px] leading-relaxed">
                {codeLines.map((line) => (
                  <div key={line.num} className="flex">
                    <span className="w-8 text-right text-gray-600 mr-4 select-none shrink-0">
                      {line.num}
                    </span>
                    <span>
                      {line.parts.map((part, i) => (
                        <span key={i} style={{ color: part.color }}>
                          {part.text}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/5 bg-linear-to-r from-amber-500/3 to-transparent p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Star className="size-3.5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-amber-400">
                      AI Generated Tags
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Generated in 0.4s
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag.label}
                      className="px-2.5 py-1 rounded-md text-xs font-medium"
                      style={{
                        background: `${tag.color}1a`,
                        border: `1px solid ${tag.color}33`,
                        color: tag.color,
                      }}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/5">
                  <div className="text-[10px] text-gray-500 mb-1">
                    AI Description
                  </div>
                  <div className="text-xs text-gray-300">
                    Custom React hook for managing user authentication state
                    with token-based session persistence.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
