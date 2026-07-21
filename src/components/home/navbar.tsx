"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import { useSession, signOut } from "@/lib/auth-client";
import { UserAvatar } from "@/components/auth/user-avatar";
import { toast } from "sonner";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "AI", href: "#ai" },
];

function useNavbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [billingLoaded, setBillingLoaded] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!session?.user;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch("/api/billing/status")
      .then((res) => res.json())
      .then((data) => {
        setIsPro(data.isPro ?? false);
        setBillingLoaded(true);
      })
      .catch(() => {
        setIsPro(false);
        setBillingLoaded(true);
      });
  }, [isLoggedIn]);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setMobileOpen(false);
      setUserMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  useEffect(() => {
    if (mobileOpen) {
      closeButtonRef.current?.focus();
    }
  }, [mobileOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setUserMenuOpen(false);
    await signOut();
    toast.success("Signed out", {
      description: "You have been logged out successfully",
    });
    router.push("/login");
  };

  return {
    session,
    scrolled,
    mobileOpen,
    setMobileOpen,
    userMenuOpen,
    setUserMenuOpen,
    isSigningOut,
    isPro,
    billingLoaded,
    isLoggedIn,
    mobileMenuRef,
    closeButtonRef,
    userMenuRef,
    handleSignOut,
  };
}

function NavLinks({ className }: { className?: string }) {
  return (
    <div className={className}>
      {navLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

function UserMenu({
  user,
  userMenuOpen,
  setUserMenuOpen,
  isSigningOut,
  handleSignOut,
  userMenuRef,
}: {
  user: { name: string; email: string };
  userMenuOpen: boolean;
  setUserMenuOpen: (open: boolean) => void;
  isSigningOut: boolean;
  handleSignOut: () => void;
  userMenuRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="relative" ref={userMenuRef}>
      <button
        onClick={() => setUserMenuOpen(!userMenuOpen)}
        aria-label="User menu"
        aria-expanded={userMenuOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-md p-1 hover:bg-white/10 transition-colors"
      >
        <UserAvatar user={user} className="w-8 h-8 rounded-md" />
      </button>

      {userMenuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-background shadow-lg z-50"
        >
          <div className="p-3 border-b border-border">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <div className="p-1">
            <Link
              href="/dashboard"
              role="menuitem"
              className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-foreground"
              onClick={() => setUserMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-sm">dashboard</span>
              Dashboard
            </Link>
            <button
              role="menuitem"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left disabled:opacity-50 text-foreground"
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

function MobileMenu({
  isOpen,
  onClose,
  isLoggedIn,
  isPro,
  billingLoaded,
  isSigningOut,
  handleSignOut,
  mobileMenuRef,
  closeButtonRef,
}: {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  isPro: boolean;
  billingLoaded: boolean;
  isSigningOut: boolean;
  handleSignOut: () => void;
  mobileMenuRef: React.RefObject<HTMLDivElement | null>;
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-72 bg-popover border-l border-border shadow-lg p-4 flex flex-col gap-2 animate-in slide-in-from-right" ref={mobileMenuRef}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-sm">Navigation</span>
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <XIcon className="size-4" />
          </Button>
        </div>
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            {link.label}
          </a>
        ))}
        <div className="h-px bg-border my-2" />
        {isLoggedIn ? (
          <>
            {!isPro && billingLoaded && (
              <Link
                href="/dashboard/upgrade"
                onClick={onClose}
                className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Upgrade
              </Link>
            )}
            <Link
              href="/dashboard"
              onClick={onClose}
              className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={() => { onClose(); handleSignOut(); }}
              disabled={isSigningOut}
              className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors text-left disabled:opacity-50"
            >
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              onClick={onClose}
              className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link href="/register" onClick={onClose}>
              <Button className="w-full bg-white text-black hover:bg-gray-200 rounded-lg px-4 py-2 text-sm font-semibold">
                Get Started
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export function Navbar() {
  const {
    session,
    scrolled,
    mobileOpen,
    setMobileOpen,
    userMenuOpen,
    setUserMenuOpen,
    isSigningOut,
    isPro,
    billingLoaded,
    isLoggedIn,
    mobileMenuRef,
    closeButtonRef,
    userMenuRef,
    handleSignOut,
  } = useNavbar();

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" />
                <path d="M3 7l9 4 9-4M12 11v10" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">DevVault</span>
          </Link>

          <NavLinks className="hidden md:flex items-center gap-1" />

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                {!isPro && billingLoaded && (
                  <Link href="/dashboard/upgrade">
                    <Button variant="ghost" className="text-sm text-muted-foreground hover:text-foreground">
                      Upgrade
                    </Button>
                  </Link>
                )}
                {session && (
                  <UserMenu
                    user={session.user}
                    userMenuOpen={userMenuOpen}
                    setUserMenuOpen={setUserMenuOpen}
                    isSigningOut={isSigningOut}
                    handleSignOut={handleSignOut}
                    userMenuRef={userMenuRef}
                  />
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link href="/register">
                  <Button className="bg-white text-black hover:bg-gray-200 rounded-lg px-4 py-2 text-sm font-semibold">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <ListIcon className="size-5" />
            </Button>
          </div>
        </div>
      </nav>

      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isLoggedIn={isLoggedIn}
        isPro={isPro}
        billingLoaded={billingLoaded}
        isSigningOut={isSigningOut}
        handleSignOut={handleSignOut}
        mobileMenuRef={mobileMenuRef}
        closeButtonRef={closeButtonRef}
      />
    </>
  );
}
