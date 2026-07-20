"use client";

import { createContext, useContext, useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextType | null>(null);

function useDropdownMenu() {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error("DropdownMenu components must be used within DropdownMenuProvider");
  }
  return context;
}

interface DropdownMenuProps {
  children: ReactNode;
}

function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-flex items-center">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

interface DropdownMenuTriggerProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
}

function DropdownMenuTrigger({ children, className }: DropdownMenuTriggerProps) {
  const { open, setOpen } = useDropdownMenu();
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={cn("inline-flex", className)}
      onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
      }}
    >
      {children}
    </div>
  );
}

interface DropdownMenuContentProps {
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
}

function DropdownMenuContent({ children, align = "end", className }: DropdownMenuContentProps) {
  const { open, setOpen } = useDropdownMenu();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-40 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        align === "end" ? "right-0" : "left-0",
        "mt-1 top-full",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

interface DropdownMenuItemProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  destructive?: boolean;
}

function DropdownMenuItem({ children, onClick, className, destructive }: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenu();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      onClick?.(e);
      setOpen(false);
    },
    [onClick, setOpen]
  );

  return (
    <button
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors w-full text-left",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:bg-accent focus:text-accent-foreground",
        destructive && "text-destructive hover:bg-destructive/10 hover:text-destructive",
        className
      )}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("-mx-1 my-1 h-px bg-muted", className)} />;
}

function DropdownMenuLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>
      {children}
    </div>
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  // fallow-ignore-next-line unused-export
  DropdownMenuSeparator,
  // fallow-ignore-next-line unused-export
  DropdownMenuLabel,
};
