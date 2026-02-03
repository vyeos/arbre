"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";

import SignOutButton from "@/components/sign-out-button";
import CurrencyBadge from "@/components/currency-badge";
import AvatarBadge from "@/components/avatar-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string | null | undefined;
};

export default function Navbar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/play", label: "Quest Arena", emoji: "⚔️" },
    { href: "/skills", label: "Skill Tree", emoji: "🌳" },
    { href: "/armory", label: "Armory", emoji: "🛡️" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-lg">
      {/* Decorative top line */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />

      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        {/* Logo and Desktop Navigation */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-linear-to-br from-primary/20 to-primary/5 text-lg shadow-lg shadow-primary/10 transition group-hover:border-primary/50 group-hover:shadow-primary/20">
              🌳
            </div>
            <span className="font-serif transition group-hover:text-primary">Arbre</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                  }`}
                >
                  <span className="text-base">{link.emoji}</span>
                  <span>{link.label}</span>
                  {active && (
                    <div className="absolute inset-x-2 -bottom-3 h-0.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Side: User Info & Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Admin Link */}
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="hidden items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:border-amber-500/50 hover:bg-amber-500/15 sm:flex"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Admin Sanctum</span>
                </Link>
              )}

              {/* User Dropdown - Desktop */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden items-center gap-3 rounded-xl border border-border/60 bg-card/50 px-3 py-2 transition hover:border-primary/40 hover:bg-card/80 lg:flex">
                    <AvatarBadge />
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <span>{user.name ?? "Player"}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{user.email}</div>
                    </div>
                    <div className="ml-1 text-muted-foreground">▾</div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-72 border-border/60 bg-card/95 backdrop-blur-lg"
                >
                  <DropdownMenuLabel className="pb-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                      <span>💰</span>
                      <span>Treasury</span>
                    </div>
                    <div className="mt-3">
                      <CurrencyBadge />
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/40" />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/character"
                      className="flex cursor-pointer items-center gap-3 px-3 py-2.5"
                    >
                      <span className="text-base">🎭</span>
                      <div>
                        <div className="text-sm font-medium">Character Vessel</div>
                        <div className="text-xs text-muted-foreground">Customize your Avatar</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/40" />
                  <DropdownMenuItem asChild>
                    <div className="w-full px-1 py-1">
                      <SignOutButton />
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-lg border border-border/60 bg-card/50 p-2 text-foreground transition hover:border-primary/40 hover:bg-card/80 lg:hidden"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/50 px-4 py-2 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:bg-card/80"
              >
                <span>🚪</span>
                <span>Enter Gate</span>
              </Link>
              <Link
                href="/signup"
                className="hidden items-center gap-1.5 rounded-lg bg-linear-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/30 sm:flex"
              >
                <span>✨</span>
                <span>Forge Avatar</span>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && user && (
        <div className="border-t border-border/40 bg-background/98 backdrop-blur-lg lg:hidden">
          <div className="mx-auto max-w-7xl space-y-4 px-4 py-5">
            {/* User Info - Mobile */}
            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 p-4">
              <AvatarBadge />
              <div className="flex flex-1 flex-col">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span>{user.name ?? "Player"}</span>
                </div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            </div>

            {/* Currency - Mobile */}
            <div className="rounded-xl border border-border/60 bg-card/50 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <span>💰</span>
                <span>Treasury</span>
              </div>
              <div className="mt-3">
                <CurrencyBadge showOnMobile />
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1">
              <div className="px-1 py-2 text-xs uppercase tracking-wider text-muted-foreground">
                Navigation
              </div>
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "border border-primary/30 bg-primary/10 text-primary"
                        : "text-foreground hover:bg-card/60"
                    }`}
                  >
                    <span className="text-lg">{link.emoji}</span>
                    <span>{link.label}</span>
                    {active && <span className="ml-auto text-xs text-primary">●</span>}
                  </Link>
                );
              })}
            </div>

            {/* Character Link - Mobile */}
            <Link
              href="/character"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/50 px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/40"
            >
              <span className="text-lg">🎭</span>
              <span>Character Vessel</span>
            </Link>

            {/* Admin Link - Mobile */}
            {user.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-300 transition hover:border-amber-500/50"
              >
                <Sparkles className="h-4 w-4" />
                <span>Admin Sanctum</span>
              </Link>
            )}

            {/* Sign Out - Mobile */}
            <div className="pt-2">
              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
