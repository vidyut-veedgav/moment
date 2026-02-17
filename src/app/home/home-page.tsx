"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { submitResponse } from "@/src/actions/responses";
import { revealMoment } from "@/src/actions/reveals";
import { signOut } from "@/src/actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type HomeState =
  | "no-moment"
  | "needs-response"
  | "waiting-for-partner"
  | "ready-to-reveal"
  | "waiting-for-partner-reveal"
  | "revealed";

interface ResponseData {
  response_id: string;
  content: string | null;
  status: string;
  responder_id: string;
  responder?: { first_name: string; last_name: string };
}

interface RevealStatusData {
  has_revealed: boolean;
}

export default function HomePage({
  state,
  partnerName,
  momentId,
  promptText,
  myResponse,
  partnerResponse,
  myRevealStatus,
  partnerRevealStatus,
}: {
  state: HomeState;
  partnerName: string;
  momentId: string;
  promptText: string;
  myResponse: ResponseData | null;
  partnerResponse: ResponseData | null;
  myRevealStatus: RevealStatusData | null;
  partnerRevealStatus: RevealStatusData | null;
}) {
  const router = useRouter();
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!responseText.trim()) return;
    setLoading(true);
    try {
      await submitResponse(momentId, responseText);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit");
      setLoading(false);
    }
  }

  async function handleReveal() {
    setLoading(true);
    try {
      await revealMoment(momentId);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reveal");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="flex items-center justify-between border-b px-6 py-4">
        <Link href="/home" className="text-xl font-bold">
          Moment
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/history" className="text-sm text-muted-foreground hover:text-foreground">
            History
          </Link>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      </nav>

      <main className="flex flex-1 items-center justify-center px-6 py-8">
        {state === "no-moment" && (
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>All caught up!</CardTitle>
              <CardDescription>
                No more prompts available. Check back later!
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {state === "needs-response" && (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{promptText}</CardTitle>
              <CardDescription>Share your response</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Textarea
                placeholder="Type your response..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={4}
              />
              <Button onClick={handleSubmit} disabled={loading || !responseText.trim()}>
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </CardContent>
          </Card>
        )}

        {state === "waiting-for-partner" && (
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>{promptText}</CardTitle>
              <CardDescription>
                Waiting for {partnerName} to respond...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You&apos;ve submitted your response. Come back once your partner has responded!
              </p>
            </CardContent>
          </Card>
        )}

        {state === "ready-to-reveal" && (
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>{promptText}</CardTitle>
              <CardDescription>Both of you have responded!</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" onClick={handleReveal} disabled={loading}>
                {loading ? "Revealing..." : "Reveal Responses"}
              </Button>
            </CardContent>
          </Card>
        )}

        {state === "waiting-for-partner-reveal" && (
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>{promptText}</CardTitle>
              <CardDescription>
                Waiting for {partnerName} to reveal...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You&apos;ve revealed! Once {partnerName} reveals too, you&apos;ll see both responses.
              </p>
            </CardContent>
          </Card>
        )}

        {state === "revealed" && (
          <div className="flex w-full max-w-2xl flex-col gap-4">
            <h2 className="text-center text-lg font-semibold">{promptText}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">You said...</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{myResponse?.content}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {partnerName} said...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{partnerResponse?.content}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
