"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

export default function PartnershipPage({
  partnerId,
}: {
  partnerId: string;
}) {
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  function generateLink() {
    const link = `${window.location.origin}/invite/${partnerId}`;
    setInviteLink(link);
  }

  async function copyLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    toast.success("Link copied to clipboard!");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Your Partnership</CardTitle>
          <CardDescription>
            Generate an invite link and send it to your partner
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {!inviteLink ? (
            <Button size="lg" onClick={generateLink}>
              Generate Invite Link
            </Button>
          ) : (
            <>
              <div className="flex w-full items-center gap-2 rounded-md border bg-muted p-3">
                <p className="flex-1 truncate text-sm">{inviteLink}</p>
                <Button variant="outline" size="sm" onClick={copyLink}>
                  Copy
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Waiting for partner to join...
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
