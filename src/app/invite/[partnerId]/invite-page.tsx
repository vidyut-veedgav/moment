"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn } from "@/src/actions/auth";
import { acceptInvite } from "@/src/actions/partnerships";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InvitePage({
  inviterName,
  inviterPartnerId,
  isAuthenticated,
}: {
  inviterName: string;
  inviterPartnerId: string;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    if (!isAuthenticated) {
      // Set cookie so callback knows to redirect back here
      document.cookie = `pending_invite=${inviterPartnerId};path=/;max-age=600`;
      await signIn();
      return;
    }

    setLoading(true);
    try {
      await acceptInvite(inviterPartnerId);
      router.push("/home");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to accept invite");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">You&apos;ve been invited!</CardTitle>
          <CardDescription>
            {inviterName} wants to be your partner on Moment
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button size="lg" onClick={handleAccept} disabled={loading}>
            {loading
              ? "Joining..."
              : isAuthenticated
                ? "Accept Invite"
                : "Sign In & Accept"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
