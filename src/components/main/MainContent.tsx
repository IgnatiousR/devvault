"use client";

import { Collection, Item } from "@/lib/constants/types";
// import { type Item, type Collection } from "@/lib/mock-data";
import { collections, items } from "@/lib/mock-data";

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
    >
      <path d="M9.41 16.75l-3.5-3.5a4.08 4.08 0 011.58-6.58L12 3v14.5zM20.6 6.85l-3.5-3.5A4.1 4.1 0 0013.5 9.5V21l3.5-3.5a4.1 4.1 0 00-6.4-5.7z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <div className="group relative bg-[#121212] border border-[#27272a] rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer">
      <div className="absolute left-0 top-6 bottom-6 w-1 bg-red-500 rounded-r-full"></div>
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="font-semibold text-lg">{collection.name}</h3>
          <p className="text-xs text-gray-400 mt-1">
            {collection.resourceCount} resources
          </p>
        </div>
        <span className="text-gray-400 group-hover:text-red-500 transition-colors">
          <ArrowRightIcon />
        </span>
      </div>
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <span
            key={i}
            className="w-8 h-8 rounded-md bg-[#1c1c1c] flex items-center justify-center"
          >
            <CodeIcon />
          </span>
        ))}
      </div>
    </div>
  );
}

function ItemCard({ item }: { item: Item }) {
  return (
    <div
      className="bg-[#121212] border border-[#27272a] rounded-xl overflow-hidden hover:border-red-500/50 hover:shadow-md transition-all cursor-pointer group"
      // onclick={(() => {}) as any}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-8 h-8 rounded ${item.itemType === "Snippet" ? "bg-red-500/10 flex items-center justify-center" : ""}`}
          >
            {item.itemType === "Snippet" ? (
              <span className="text-red-500 font-bold text-xs">s</span>
            ) : (
              <span className="text-orange-500 font-bold text-xs">
                {item.itemType[0]}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Snippet
          </span>
        </div>
        <h4 className="font-semibold mb-2 text-white group-hover:text-red-500 transition-colors">
          Tailwind Config
        </h4>
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
          Enterprise level configuration including custom theme tokens for
          responsive design systems.
        </p>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-[11px] font-medium bg-[#1c1c1c] px-2 py-0.5 rounded border border-[#27272a]">
            {/*{collection.name}*/}test
          </span>
          <span className="text-[11px] text-gray-400">2h ago</span>
        </div>
      </div>
    </div>
  );
}

function Drawer({ title, type }: { title: string; type: string }) {
  const typeColor = {
    snippet: "bg-red-500/10",
    prompt: "bg-orange-500/10",
    command: "bg-amber-500/10",
    note: "bg-yellow-400/10",
    link: "bg-emerald-400/10",
  };

  return (
    <div className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-[#0a0a0a] border-l border-[#27272a] shadow-2xl z-50 translate-x-full sheet-drawer flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a]">
        <div className="flex items-center gap-3">
          {/*{typeColor[type]}*/} test
          <span className="text-white">{title}</span>
        </div>
        <button
          // onClick={() => ({}) as any}
          className="p-2 hover:bg-[#27272a] rounded-md transition-colors text-gray-400 hover:text-white"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

export function MainContent() {
  return (
    <main className="pl-64 pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-12">
        {/* Collections Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Collections</h2>
              <p className="text-sm text-gray-400 mt-1">
                Organize your resources by project or technology.
              </p>
            </div>
            <a
              href="#"
              className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
            >
              View all collections
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <CollectionCard key={collection.name} collection={collection} />
            ))}
          </div>
        </section>

        {/* Recent Items Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Recent Items</h2>
            <div className="flex items-center gap-2 p-1 bg-[#1c1c1c] rounded-md border border-[#27272a]">
              <button className="px-3 py-1 text-[11px] font-semibold uppercase bg-[#0a0a0a] border border-[#27272a] rounded shadow-sm">
                Grid
              </button>
              <button className="px-3 py-1 text-[11px] font-semibold uppercase text-gray-400 hover:text-white transition-colors">
                List
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
