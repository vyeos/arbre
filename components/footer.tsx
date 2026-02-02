import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border/60 bg-card/50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Arbre Realm</p>
          <p className="text-foreground">Forge mind, bind Relics, master Quests.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/play" className="transition hover:text-foreground">
            Quest Arena
          </Link>
          <Link href="/skills" className="transition hover:text-foreground">
            Skill Tree
          </Link>
          <Link href="/armory" className="transition hover:text-foreground">
            Armory
          </Link>
          <Link href="/character" className="transition hover:text-foreground">
            Avatar
          </Link>
        </div>
      </div>
    </footer>
  );
}
