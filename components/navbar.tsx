"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Swords, User, BookOpen, Vault } from "lucide-react";

import SignOutButton from "@/components/sign-out-button";
import CurrencyBadge from "@/components/currency-badge";
import AvatarBadge from "@/components/avatar-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
    { href: "/skills", label: "Skill Tree", icon: BookOpen },
    { href: "/play", label: "Quest Arena", icon: Swords },
    { href: "/armory", label: "Relic Vault", icon: Vault },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        {/* Logo and Desktop Navigation */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground transition hover:text-primary"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              ⚔
            </div>
            <span>Arbre</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
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
                  className="hidden rounded-lg border border-border bg-background/70 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary/70 hover:bg-primary/5 sm:block"
                >
                  Admin Sanctum
                </Link>
              )}

              {/* User Dropdown - Desktop */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden items-center gap-2 rounded-lg border border-border bg-background/70 px-3 py-2 transition hover:border-primary/70 hover:bg-accent lg:flex">
                    <AvatarBadge />
                    <div className="flex flex-col text-left">
                      <div className="text-xs font-semibold text-foreground">
                        {user.name ?? "Player"}
                      </div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      Currency
                    </div>
                    <div className="mt-2">
                      <CurrencyBadge />
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/character" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      Character Vessel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <div className="w-full">
                      <SignOutButton />
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-md p-2 text-foreground transition hover:bg-accent lg:hidden"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-border bg-card/70 px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/60"
              >
                Enter the Gate
              </Link>
              <Link
                href="/signup"
                className="hidden rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 sm:block"
              >
                Forge Character Vessel
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && user && (
        <div className="border-t border-border bg-background/98 lg:hidden">
          <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
            {/* User Info - Mobile */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3">
              <AvatarBadge />
              <div className="flex flex-1 flex-col">
                <div className="text-sm font-semibold text-foreground">{user.name ?? "Player"}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            </div>

            {/* Currency - Mobile */}
            <div className="rounded-lg border border-border bg-card/50 p-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Currency</div>
              <div className="mt-2">
                <CurrencyBadge showOnMobile />
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive(link.href)
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Admin Link - Mobile */}
            {user.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-lg border border-border bg-background/70 px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary/70"
              >
                Admin Sanctum
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
