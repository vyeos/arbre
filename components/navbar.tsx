import Link from "next/link";

import { getCurrentUser } from "@/lib/auth-session";
import SignOutButton from "@/components/sign-out-button";

export default async function Navbar() {
  const user = await getCurrentUser();
  const navLinks = [
    { href: "/", label: "Character Overview" },
    { href: "/skills", label: "Skill Branches" },
    { href: "/demo", label: "Demo Arena" },
    { href: "/play", label: "Quest Arena" },
    { href: "/tutorial", label: "Tutorial Quest" },
    { href: "/purchase", label: "Relic Vault" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold tracking-wide text-foreground">
            Arbre
          </Link>
          <div className="hidden items-center gap-3 text-xs text-muted-foreground md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-1 transition hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-right text-xs text-muted-foreground sm:block">
                <div className="font-semibold text-foreground">{user.name ?? "Player"}</div>
                <div>{user.email}</div>
              </div>
              <SignOutButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg border border-border bg-card/70 px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/60"
              >
                Enter the Gate
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Forge a Character Vessel
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
