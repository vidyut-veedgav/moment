"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  createDevMoment,
  resetMoment,
  deleteDevMoment,
} from "@/src/actions/moments";
import { Wrench, Plus, RotateCcw, Trash2, X } from "lucide-react";

export default function DevPanel({
  partnershipId,
  momentId,
}: {
  partnershipId: string;
  momentId: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  async function handle(
    action: string,
    fn: () => Promise<unknown>
  ) {
    setLoading(action);
    try {
      await fn();
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setLoading(null);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg transition-transform hover:scale-110"
        title="Dev Tools"
      >
        <Wrench className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-56 rounded-lg border border-amber-500/30 bg-background p-3 shadow-xl">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-amber-500">DEV TOOLS</span>
        <button
          onClick={() => setOpen(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="justify-start gap-2 text-xs"
          disabled={loading !== null}
          onClick={() =>
            handle("create", () => createDevMoment(partnershipId))
          }
        >
          <Plus className="h-3.5 w-3.5" />
          {loading === "create" ? "Creating..." : "Create Moment"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="justify-start gap-2 text-xs"
          disabled={loading !== null || !momentId}
          onClick={() =>
            handle("reset", () => resetMoment(momentId!))
          }
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {loading === "reset" ? "Resetting..." : "Reset Moment"}
        </Button>

        <Button
          variant="destructive"
          size="sm"
          className="justify-start gap-2 text-xs"
          disabled={loading !== null || !momentId}
          onClick={() =>
            handle("delete", () => deleteDevMoment(momentId!))
          }
        >
          <Trash2 className="h-3.5 w-3.5" />
          {loading === "delete" ? "Deleting..." : "Delete Moment"}
        </Button>
      </div>
    </div>
  );
}
