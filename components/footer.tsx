import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border/40 bg-linear-to-b from-card/50 to-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-start md:justify-between">
        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌳</span>
            <p className="font-serif text-lg font-semibold text-foreground">Arbre Realm</p>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Forge your mind, bind Relics, and master every Quest. Your legend awaits.
          </p>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-8 text-sm md:grid-cols-4">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Arena
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/play"
                className="flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
              >
                <span>⚔️</span>
                <span>Quest Arena</span>
              </Link>
              <Link
                href="/demo"
                className="flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
              >
                <span>🎮</span>
                <span>Demo Quest</span>
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Build
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/skills"
                className="flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
              >
                <span>🌳</span>
                <span>Skill Tree</span>
              </Link>
              <Link
                href="/armory"
                className="flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
              >
                <span>🛡️</span>
                <span>Armory</span>
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Avatar
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/character"
                className="flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
              >
                <span>🎭</span>
                <span>Character</span>
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Gate
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                className="flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
              >
                <span>🚪</span>
                <span>Enter Gate</span>
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
              >
                <span>✨</span>
                <span>Forge Avatar</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/30">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 text-xs text-muted-foreground">
          <span>© 2026 Arbre Realm. All rights reserved.</span>
          <span className="flex items-center gap-1">
            <span>Built with</span>
            <span>⚡</span>
            <span>for Players</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
