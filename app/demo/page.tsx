import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background via-card to-background text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <Card className="bg-card/80 shadow-xl">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Realm Update</p>
            <CardTitle className="text-3xl">Demo Mode Has Closed</CardTitle>
            <CardDescription>
              The Quest Arena is now fully live. Bind your account to enter the full realm.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/play">Enter the Quest Arena</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/signup">Forge Character Vessel</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
