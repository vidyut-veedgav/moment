"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PulsingDots from "@/components/pulsing-dots";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function PartnershipPage({
  partnerId,
}: {
  partnerId: string;
}) {
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  useEffect(() => {
    const link = `${window.location.origin}/invite/${partnerId}`;
    setInviteLink(link);
    navigator.clipboard.writeText(link).then(() => {
      toast.success("Invite link copied to clipboard!");
    }).catch(() => {
      // Clipboard write requires a user gesture in some browsers — silently ignore
    });
  }, [partnerId]);

  async function copyLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    toast.success("Link copied to clipboard!");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Create Your Partnership
            </CardTitle>
            <CardDescription>
              Share this link with your partner and we'll notify you when they join!
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {inviteLink && (
              <>
                <div className="flex w-full items-center gap-2 rounded-xl border bg-muted/50 p-3">
                  <p className="flex-1 truncate text-sm">{inviteLink}</p>
                  <Button variant="outline" size="sm" onClick={copyLink}>
                    Copy
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <PulsingDots size="sm" />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
