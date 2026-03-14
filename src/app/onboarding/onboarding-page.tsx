"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { updatePhone } from "@/src/actions/auth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

function formatToE164(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formatted = formatToE164(phone);

    if (!/^\+[1-9]\d{1,14}$/.test(formatted)) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    if (!smsConsent) {
      toast.error("You must agree to receive text messages to continue.");
      return;
    }

    setLoading(true);
    try {
      await updatePhone(formatted);
      router.refresh();
    } catch {
      toast.error("Failed to save phone number.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md" />

      {/* Modal card */}
      <motion.div
        className="relative z-10 w-full max-w-sm px-6"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border bg-card shadow-xl p-8 flex flex-col gap-7"
        >
          {/* Icon + heading */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-display font-bold text-2xl tracking-tight">
                One last step
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Add your phone number and we&apos;ll let you know when your daily prompt is ready.
              </p>
            </div>
          </div>

          {/* Phone input */}
          <Input
            type="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 text-base text-center tracking-wide"
            required
          />

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="h-12 rounded-xl text-base"
            disabled={loading || !phone.trim() || !smsConsent}
          >
            {loading ? "Saving..." : "Continue"}
          </Button>
        </form>
      </motion.div>

      {/* Legal consent — pinned to bottom */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-10 px-6 pb-8 pt-5 bg-gradient-to-t from-background via-background/95 to-transparent"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
      >
        <div className="flex items-start gap-3 max-w-sm mx-auto">
          <Checkbox
            id="sms-consent"
            checked={smsConsent}
            onCheckedChange={(checked) => setSmsConsent(checked === true)}
            className="mt-0.5 shrink-0"
          />
          <Label
            htmlFor="sms-consent"
            className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
          >
            By checking this box, I agree to receive recurring SMS notifications
            from Moment, including daily prompt releases and partner activity
            alerts. Message frequency varies (up to 3 messages per day). Note that message
            and data rates may apply and you can reply STOP to opt out at any time.{" "}
            <a href="/terms" className="underline hover:text-foreground transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            .
          </Label>
        </div>
      </motion.div>
    </div>
  );
}
