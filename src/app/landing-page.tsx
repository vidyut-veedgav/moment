"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "@/src/actions/auth";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-12 px-6">
      <h1 className="text-4xl font-bold tracking-tight">Moment</h1>

      <div className="flex gap-4">
        <div className="h-32 w-32 rounded-lg bg-muted" />
        <div className="h-32 w-32 rounded-lg bg-muted" />
        <div className="h-32 w-32 rounded-lg bg-muted" />
      </div>

      <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
        <p>Share moments that matter</p>
        <p>Reveal them together</p>
        <p>Strengthen your connection</p>
      </div>

      <Button size="lg" onClick={() => signIn()}>
        Get Started
      </Button>
    </div>
  );
}
