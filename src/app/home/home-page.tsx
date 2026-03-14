"use client";

import { submitResponse } from "@/src/actions/responses";
import { revealMoment } from "@/src/actions/reveals";
import RealtimeRefresh from "@/src/app/home/realtime-refresh";
import AppNav from "@/components/app-nav";
import DevPanel from "@/components/dev-panel";
import NoMomentState from "@/src/app/home/components/no-moment-state";
import NeedsResponseState from "@/src/app/home/components/needs-response-state";
import WaitingState from "@/src/app/home/components/waiting-state";
import ReadyToRevealState from "@/src/app/home/components/ready-to-reveal-state";
import RevealedState from "@/src/app/home/components/revealed-state";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type HomeState =
  | "no-moment"
  | "needs-response"
  | "waiting-for-partner"
  | "ready-to-reveal"
  | "revealed";

interface ResponseData {
  response_id: string;
  content: string | null;
  status: string;
  responder_id: string;
  responder?: { first_name: string; last_name: string };
}

export default function HomePage({
  state,
  partnerName,
  partnershipId,
  momentId,
  promptText,
  myResponse,
  partnerResponse,
  showDevTools,
}: {
  state: HomeState;
  partnerName: string;
  partnershipId: string;
  momentId: string;
  promptText: string;
  myResponse: ResponseData | null;
  partnerResponse: ResponseData | null;
  showDevTools: boolean;
}) {
  const router = useRouter();
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [state]);

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
      {state !== "no-moment" && <RealtimeRefresh momentId={momentId} />}

      <AppNav />

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-8">
        {state === "no-moment" && <NoMomentState />}

        {state === "needs-response" && (
          <NeedsResponseState
            promptText={promptText}
            responseText={responseText}
            onResponseChange={setResponseText}
            onSubmit={handleSubmit}
            loading={loading}
          />
        )}

        {state === "waiting-for-partner" && (
          <WaitingState promptText={promptText} partnerName={partnerName} />
        )}

        {state === "ready-to-reveal" && (
          <ReadyToRevealState
            promptText={promptText}
            onReveal={handleReveal}
            loading={loading}
          />
        )}

        {state === "revealed" && (
          <RevealedState
            promptText={promptText}
            myContent={myResponse?.content ?? null}
            partnerName={partnerName}
            partnerContent={partnerResponse?.content ?? null}
          />
        )}

      </main>

      {showDevTools && (
        <DevPanel
          partnershipId={partnershipId}
          momentId={momentId || null}
        />
      )}
    </div>
  );
}
