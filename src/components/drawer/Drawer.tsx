"use client";

import { typeColors } from "@/constants/type-colors";

type ItemColors = "red" | "orange" | "amber" | "yellow" | "emerald";

// Inline SVG icons to avoid dependency issues
function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
      <path d="M10 13a5 5 0 007.54.58l2.41-2.41A5 5 0 0014 12M12 9V6m0 0l3.25 1.5M14.97 4.46a9 9 0 11-12 12M12 17v4"/>
    </svg>
  );
}


interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    itemType: string;
    title: string;
    tags: string[];
  };
}

export function Drawer({ isOpen, onClose, item }: DrawerProps) {
  const color: ItemColors = (item?.itemType ? typeColors[item.itemType as keyof typeof typeColors] : "red") as ItemColors;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-[#0a0a0a]/60 backdrop-blur-[2px] z-[50] hidden" onClick={onClose}></div>

      {/* Drawer Panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-[480px] bg-[#0a0a0a] border-l border-[#27272a] shadow-2xl z-[60] translate-x-full transition-transform duration-300 ease-out flex flex-col ${!isOpen ? "translate-x-full" : ""}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a]">
          <div className={`flex items-center gap-3 `}>
            {color === "red" && <span className="text-red-500">{item.itemType[0]}</span>}
            <h3 className="text-base font-semibold leading-none text-white">{item.title}</h3>
            <p className="text-[11px] text-gray-400 mt-1">Web Utilities / {item.itemType}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onClose} className="p-2 hover:bg-[#27272a] rounded-md transition-colors text-gray-400 hover:text-white">
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Content */}
          <section>
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Content</h5>
            <div className={`bg-[#1c1c1c] border border-[#27272a] rounded-lg overflow-hidden ${color === "red" ? "font-mono" : ""}`}>
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#27272a] bg-[#1c1c1c]/30">
                <span className="text-[10px] text-gray-400">{item.itemType.toLowerCase()}.js</span>
                <button className="text-[10px] font-semibold text-red-500 flex items-center gap-1 hover:underline">
                  <CopyIcon />
                  COPY
                </button>
              </div>
              <pre className="p-4 text-[13px] leading-relaxed overflow-x-auto"><code className="text-emerald-400">{`module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: "#ef4444",
        surface: "#0a0a0a",
      },
    },
  },
}`}</code></pre>
            </div>
          </section>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Collection</h5>
              <div className="flex items-center gap-2 bg-[#1c1c1c] px-3 py-2 rounded-md border border-[#27272a]">
                {item.itemType === "link" ? (
                  <LinkIcon />
                ) : (
                  <FolderIcon />
                )}
                <span className="text-sm font-medium">Web Utilities</span>
              </div>
            </div>
            <div>
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Type</h5>
              <div className="flex items-center gap-2 bg-[#1c1c1c] px-3 py-2 rounded-md border border-[#27272a]">
                {color === "red" && (
                  <span className="text-red-500 text-xs font-bold">{item.itemType[0]}</span>
                )}
                {color === "orange" && (
                  <span className="text-orange-500 text-xs font-bold">{item.itemType[0]}</span>
                )}
                {color === "amber" && (
                  <span className="text-amber-500 text-xs font-bold">{item.itemType[0]}</span>
                )}
                <span className="text-sm font-medium">{item.itemType}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <section>
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Tags</h5>
            <div className="flex flex-wrap gap-2">
              {item?.tags?.map((tag: string, i: number) => (
                <span key={i} className={`px-2 py-1 bg-[#1c1c1c] border border-[#27272a] rounded text-[11px] font-medium text-gray-400 #${tag}`}>
                  {tag}
                </span>
              ))}
              <button className="px-2 py-1 border border-dashed border-[#27272a] rounded text-[11px] font-medium text-gray-400 hover:border-red-500 hover:text-red-500 transition-all">
                + Add Tag
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#27272a] bg-[#1c1c1c]/20 flex items-center justify-between">
          <span className="text-xs text-gray-400 italic">Last modified 2 hours ago</span>
          <button className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors rounded-md border border-red-500/20">
            Delete Item
          </button>
        </div>
      </div>
    </>
  );
}
