import { Code, Star, MagnifyingGlass, Terminal, FileText, Bookmark } from "@phosphor-icons/react";

const features = [
  {
    title: "Code Snippets",
    description:
      "Save reusable code with syntax highlighting for 40+ languages. Tag, organize, and find them in milliseconds.",
    color: "#ef4444",
    Icon: Code,
  },
  {
    title: "AI Prompts",
    description:
      "Curate prompts that actually work. Track variables, models, and outcomes. Build your personal prompt library.",
    color: "#f97316",
    Icon: Star,
  },
  {
    title: "Instant Search",
    description:
      "Sub-50ms fuzzy search across everything. Cmd+K from anywhere. Find that snippet you saved 8 months ago.",
    color: "#f59e0b",
    Icon: MagnifyingGlass,
  },
  {
    title: "Commands",
    description:
      'Store terminal commands with context. Never Google "how to undo git push" again. One-click copy.',
    color: "#10b981",
    Icon: Terminal,
  },
  {
    title: "Files & Docs",
    description:
      "Drop PDFs, markdown files, design assets. Preview inline. Link related items together into collections.",
    color: "#6b7280",
    Icon: FileText,
  },
  {
    title: "Collections",
    description:
      "Group snippets, prompts, and links into project collections. Share with your team. Perfect for onboarding.",
    color: "#6366f1",
    Icon: Bookmark,
  },
];

export function Features() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <div className="text-xs uppercase tracking-wider text-red-400 font-semibold mb-3">
            Everything in one place
          </div>
          <h2 className="font-bold text-4xl lg:text-5xl tracking-tight mb-4">
            Built for every kind of{" "}
            <span className="gradient-text">developer knowledge</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Seven item types. One searchable home. Stop juggling six tools —
            keep it all in DevVault.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] p-7 hover:-translate-y-1 hover:border-white/20 transition-all duration-300"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{
                  background: `${feature.color}1a`,
                  border: `1px solid ${feature.color}4d`,
                }}
              >
                <feature.Icon
                  className="size-6"
                  style={{ color: feature.color }}
                />
              </div>
              <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
