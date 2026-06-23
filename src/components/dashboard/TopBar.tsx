import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function TopBar() {
  return (
    <header className="sticky top-0 h-16 shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 flex items-center justify-between px-4 md:px-8 transition-all ease-linear duration-200">
      <div className="flex items-center gap-2 flex-1 max-w-md relative">
        <SidebarTrigger />
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm ml-8">
          search
        </span>
        <Input
          className="w-full h-9 bg-muted/50 border-input rounded-md pl-9 pr-4 ml-8 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring transition-all"
          placeholder="Search... (⌘K)"
          type="text"
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1 mr-2">
          <a
            className="px-3 py-1.5 text-sm font-medium rounded-md bg-accent text-accent-foreground"
            href="#"
          >
            Recent
          </a>
          <a
            className="px-3 py-1.5 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground transition-all"
            href="#"
          >
            Pinned
          </a>
          <a
            className="px-3 py-1.5 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground transition-all"
            href="#"
          >
            Shared
          </a>
        </div>
        <Button variant="outline" className="h-9 px-4 text-sm font-medium btn-outline">
          New Collection
        </Button>
        <Button className="h-9 px-4 text-sm font-medium btn-primary text-white">
          New Item
        </Button>
        <div className="h-4 w-px bg-border mx-1"></div>
        <button className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors relative">
          <span className="material-symbols-outlined text-lg">
            notifications
          </span>
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-[var(--color-brand-red)] rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
