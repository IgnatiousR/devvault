"use client";

import { useRef, useEffect, useState } from "react";

interface IconState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotV: number;
  scale: number;
}

interface IconData {
  label: string;
  color: string;
  bg: string;
  svg: string;
}

const SVG_ICONS: IconData[] = [
  {
    label: "Notion",
    color: "#ffffff",
    bg: "rgba(30,30,40,0.9)",
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19l.001.001c.372.14.467.513.373.933-.28.606-1.027.84-1.635.56L4.55 19.235c-.093-.327-.093-.7.187-.84l.84-.373V9.32l-1.12-.047c-.467-.046-.84-.42-.747-1.026l3.36-1.681 4.577 7.139V7.932l1.214-.093z"/></svg>',
  },
  {
    label: "GitHub",
    color: "#ffffff",
    bg: "rgba(40,40,50,0.9)",
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
  },
  {
    label: "Slack",
    color: "#ffffff",
    bg: "rgba(25,25,35,0.9)",
    svg: '<svg viewBox="0 0 24 24"><path fill="#36C5F0" d="M5.042 15.165a2.528 2.528 0 0 1-2.525 2.525 2.528 2.528 0 0 1 0-5.05h2.525v2.525zM6.313 15.165a2.528 2.528 0 0 1 5.05 0v6.313a2.528 2.528 0 0 1-5.05 0v-6.313zM8.838 5.042a2.528 2.528 0 0 1-2.525 2.525 2.528 2.528 0 0 1 0-5.05h2.525v2.525zM8.838 6.313a2.528 2.528 0 0 1 0 5.05H2.525a2.528 2.528 0 0 1 0-5.05h6.313zM18.962 8.838a2.528 2.528 0 0 1 2.525-2.525 2.528 2.528 0 0 1 0 5.05h-2.525V8.838zM17.688 8.838a2.528 2.528 0 0 1-5.05 0V2.525a2.528 2.528 0 0 1 5.05 0v6.313zM15.163 18.962a2.528 2.528 0 0 1 2.525-2.525 2.528 2.528 0 0 1 0 5.05h-2.525v-2.525zM15.163 17.688a2.528 2.528 0 0 1 0-5.05h6.313a2.528 2.528 0 0 1 0 5.05h-6.313z"/></svg>',
  },
  {
    label: "VS Code",
    color: "#0078d4",
    bg: "rgba(0,120,212,0.15)",
    svg: '<svg viewBox="0 0 24 24" fill="#0078d4"><path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.943-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.4 16.244l-7.247-6.831L17.75 5.17v13.66z"/></svg>',
  },
  {
    label: "Browser",
    color: "#e2e8f0",
    bg: "rgba(20,25,35,0.8)",
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8h20"/><circle cx="5" cy="6" r="0.5" fill="currentColor"/><circle cx="7" cy="6" r="0.5" fill="currentColor"/><path d="M9 6h11" stroke-dasharray="2 2"/></svg>',
  },
  {
    label: "Terminal",
    color: "#22c55e",
    bg: "rgba(15,25,15,0.8)",
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
  },
  {
    label: "Files",
    color: "#94a3b8",
    bg: "rgba(20,22,30,0.8)",
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></svg>',
  },
  {
    label: "Bookmarks",
    color: "#f59e0b",
    bg: "rgba(30,25,15,0.9)",
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
  },
];

const ICON_SIZE = 56;

function useChaoticIcons(containerRef: React.RefObject<HTMLDivElement | null>) {
  const iconsRef = useRef<IconState[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [positions, setPositions] = useState<
    { x: number; y: number; rot: number; scale: number }[]
  >([]);

  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const field = containerRef.current;
    if (!field) return;

    const rect = field.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    iconsRef.current = SVG_ICONS.map(() => ({
      x: Math.random() * Math.max(1, w - ICON_SIZE),
      y: Math.random() * Math.max(1, h - ICON_SIZE),
      vx: (Math.random() - 0.5) * 1.4,
      vy: (Math.random() - 0.5) * 1.4,
      rot: (Math.random() - 0.5) * 30,
      rotV: (Math.random() - 0.5) * 0.3,
      scale: 1,
    }));

    setPositions(
      iconsRef.current.map((ic) => ({
        x: ic.x,
        y: ic.y,
        rot: ic.rot,
        scale: ic.scale,
      }))
    );

    const onMouseMove = (e: MouseEvent) => {
      const r = field.getBoundingClientRect();
      mouseRef.current.x = e.clientX - r.left;
      mouseRef.current.y = e.clientY - r.top;
      mouseRef.current.active = true;
    };
    const onMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };
    const onTouchMove = (e: TouchEvent) => {
      const r = field.getBoundingClientRect();
      mouseRef.current.x = e.touches[0].clientX - r.left;
      mouseRef.current.y = e.touches[0].clientY - r.top;
      mouseRef.current.active = true;
    };

    field.addEventListener("mousemove", onMouseMove);
    field.addEventListener("mouseleave", onMouseLeave);
    field.addEventListener("touchmove", onTouchMove, { passive: true });

    if (prefersReducedMotion.current) {
      return () => {
        field.removeEventListener("mousemove", onMouseMove);
        field.removeEventListener("mouseleave", onMouseLeave);
        field.removeEventListener("touchmove", onTouchMove);
      };
    }

    lastTimeRef.current = performance.now();

    function applyRepelForce(ic: IconState, mouse: typeof mouseRef.current, repelR: number) {
      if (!mouse.active) return;
      const cx = ic.x + ICON_SIZE / 2;
      const cy = ic.y + ICON_SIZE / 2;
      const dx = cx - mouse.x;
      const dy = cy - mouse.y;
      const distSq = dx * dx + dy * dy;
      if (distSq >= repelR * repelR || distSq <= 1) return;
      const dist = Math.sqrt(distSq);
      const force = (1 - dist / repelR) * 1.2;
      ic.vx += (dx / dist) * force;
      ic.vy += (dy / dist) * force;
    }

    function clampPosition(ic: IconState, fw: number, fh: number) {
      if (ic.x < 0) {
        ic.x = 0;
        ic.vx = Math.abs(ic.vx) * 0.85;
      }
      if (ic.x > fw - ICON_SIZE) {
        ic.x = fw - ICON_SIZE;
        ic.vx = -Math.abs(ic.vx) * 0.85;
      }
      if (ic.y < 0) {
        ic.y = 0;
        ic.vy = Math.abs(ic.vy) * 0.85;
      }
      if (ic.y > fh - ICON_SIZE) {
        ic.y = fh - ICON_SIZE;
        ic.vy = -Math.abs(ic.vy) * 0.85;
      }
    }

    function applyDamping(ic: IconState) {
      ic.vx *= 0.985;
      ic.vy *= 0.985;
      const speed = Math.hypot(ic.vx, ic.vy);
      const maxV = 4;
      if (speed < 0.4) {
        ic.vx += (Math.random() - 0.5) * 0.25;
        ic.vy += (Math.random() - 0.5) * 0.25;
      }
      if (speed > maxV) {
        ic.vx = (ic.vx / speed) * maxV;
        ic.vy = (ic.vy / speed) * maxV;
      }
    }

    const animate = (now: number) => {
      const dt = Math.min(2, (now - lastTimeRef.current) / 16);
      lastTimeRef.current = now;
      const r = field.getBoundingClientRect();
      const fw = r.width;
      const fh = r.height;

      iconsRef.current.forEach((ic) => {
        applyRepelForce(ic, mouseRef.current, 110);
        ic.x += ic.vx * dt;
        ic.y += ic.vy * dt;
        clampPosition(ic, fw, fh);
        applyDamping(ic);
        ic.rot += ic.rotV * dt;
        ic.scale = 1 + Math.sin(now / 1200 + ic.x * 0.01) * 0.02;
      });

      setPositions(
        iconsRef.current.map((ic) => ({
          x: ic.x,
          y: ic.y,
          rot: ic.rot,
          scale: ic.scale,
        }))
      );

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const rect = field.getBoundingClientRect();
        iconsRef.current.forEach((ic) => {
          ic.x = Math.min(ic.x, Math.max(0, rect.width - ICON_SIZE));
          ic.y = Math.min(ic.y, Math.max(0, rect.height - ICON_SIZE));
        });
      }, 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      field.removeEventListener("mousemove", onMouseMove);
      field.removeEventListener("mouseleave", onMouseLeave);
      field.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
    };
  }, [containerRef]);

  return positions;
}

export function ChaosOrder() {
  return (
    <section className="relative py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-4 items-stretch">
          <ChaosContainer />
          <ArrowConnector />
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}

function ChaosContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const positions = useChaoticIcons(containerRef);

  return (
    <div
      ref={containerRef}
      className="relative rounded-3xl border border-white/10 bg-[radial-gradient(400px_circle_at_20%_20%,rgba(239,68,68,0.08),transparent_50%),radial-gradient(400px_circle_at_80%_80%,rgba(245,158,11,0.06),transparent_50%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.2))] aspect-square lg:aspect-auto lg:min-h-110 p-1 overflow-hidden"
    >
      <div className="absolute top-4 left-4 z-10">
        <div className="text-xs uppercase tracking-wider text-red-400/80 font-semibold mb-1">
          Before
        </div>
        <div className="text-sm text-gray-300 font-medium">
          Your knowledge today...
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
        <span className="text-xs text-red-300 font-medium">Chaotic</span>
      </div>

      {SVG_ICONS.map((icon, i) => {
        const pos = positions[i];
        return (
          <div
            key={icon.label}
            className="absolute w-14 h-14 flex items-center justify-center rounded-xl border border-white/10 backdrop-blur-sm shadow-lg"
            style={{
              background: icon.bg,
              transform: pos
                ? `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rot}deg) scale(${pos.scale})`
                : undefined,
            }}
            dangerouslySetInnerHTML={{ __html: icon.svg }}
          />
        );
      })}
    </div>
  );
}

function ArrowConnector() {
  return (
    <div className="flex items-center justify-center min-h-20 lg:min-h-110">
      <div className="animate-pulse-arrow">
        <svg
          width="120"
          height="60"
          viewBox="0 0 120 60"
          fill="none"
          className="hidden lg:block"
        >
          <defs>
            <linearGradient id="arrowGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <path
            d="M5 30 L100 30"
            stroke="url(#arrowGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M90 18 L110 30 L90 42"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <svg
          width="60"
          height="120"
          viewBox="0 0 60 120"
          fill="none"
          className="lg:hidden"
        >
          <defs>
            <linearGradient id="arrowGradV" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <path
            d="M30 5 L30 100"
            stroke="url(#arrowGradV)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M18 90 L30 110 L42 90"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}

const itemTypes = [
  { name: "Snippet", color: "#ef4444", title: "useAuth.ts", sub: "React hook" },
  { name: "Prompt", color: "#f97316", title: "Code Review", sub: "GPT-4, 3 vars" },
  { name: "Command", color: "#f59e0b", title: "docker ps -a", sub: "Linux" },
  { name: "Note", color: "#fde047", title: "API Design", sub: "REST patterns" },
  { name: "Image", color: "#ec4899", title: "Architecture", sub: "PNG · 1.2MB" },
  { name: "Link", color: "#10b981", title: "Stripe Docs", sub: "stripe.com" },
];

function DashboardPreview() {
  return (
    <div className="relative rounded-3xl border border-white/10 bg-linear-to-br from-[#13131f] to-[#0d0d16] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] min-h-110">
      <div className="absolute top-4 left-4 z-10">
        <div className="text-xs uppercase tracking-wider text-emerald-400/80 font-semibold mb-1">
          After
        </div>
        <div className="text-sm text-gray-300 font-medium">
          ...with DevVault
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
        <span className="text-xs text-emerald-300 font-medium">
          Organized
        </span>
      </div>

      <div className="absolute inset-0 pt-16 flex">
        <div className="w-12 border-r border-white/5 flex flex-col items-center py-3 gap-3 bg-black/20">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-red-500 to-red-600 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" />
            </svg>
          </div>
          <div className="w-full h-px bg-white/5 my-1" />
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-md hover:bg-white/5 flex items-center justify-center"
            >
              <div className="w-3 h-3 rounded bg-gray-600" />
            </div>
          ))}
        </div>

        <div className="flex-1 p-3 overflow-hidden">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/5 border border-white/5 mb-3">
            <div className="text-[10px] text-gray-500 font-mono">
              Search 247 items...
            </div>
          </div>

          <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-2 px-1">
            Recent Items
          </div>

          <div className="grid grid-cols-2 gap-2">
            {itemTypes.map((item) => (
              <div
                key={item.name}
                className="rounded-md bg-white/2 border border-white/5 overflow-hidden hover:bg-white/4 transition-colors"
              >
                <div className="h-0.5" style={{ background: item.color }} />
                <div className="p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: item.color }}
                    />
                    <span
                      className="text-[8px] font-semibold uppercase"
                      style={{ color: item.color }}
                    >
                      {item.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-white font-medium font-mono">
                    {item.title}
                  </div>
                  <div className="text-[8px] text-gray-500 mt-0.5">
                    {item.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
