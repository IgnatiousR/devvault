"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { UserAvatar } from "./user-avatar";
import { toast } from "sonner";

interface UserMenuProps {
  showUserInfo?: boolean;
}

export function UserMenu({ showUserInfo = false }: UserMenuProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    toast.success("Signed out", {
      description: "You have been logged out successfully",
    });
    router.push("/login");
  };

  if (!session?.user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-md p-1 hover:bg-accent transition-colors w-full"
      >
        <UserAvatar
          user={session.user}
          className="w-8 h-8 rounded-md"
        />
        {showUserInfo && (
          <div className="text-left group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
          </div>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 bottom-full mb-1 w-56 rounded-lg border bg-background shadow-lg z-50"
        >
          <div className="p-3 border-b">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {session.user.email}
            </p>
          </div>
          <div className="p-1">
            <Link
              href="/profile"
              role="menuitem"
              className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span className="material-symbols-outlined text-sm">person</span>
              Profile
            </Link>
            <Link
              href="/settings"
              role="menuitem"
              className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span className="material-symbols-outlined text-sm">settings</span>
              Settings
            </Link>
            <button
              role="menuitem"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
