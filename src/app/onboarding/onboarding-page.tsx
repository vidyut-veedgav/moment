"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { updatePhone } from "@/src/actions/auth";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
              Welcome to Moment
            </CardTitle>
            <CardDescription>
              Enter your phone number.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                type="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <div className="flex items-start gap-3">
                <Checkbox
                  id="sms-consent"
                  checked={smsConsent}
                  onCheckedChange={(checked) => setSmsConsent(checked === true)}
                />
                <Label htmlFor="sms-consent" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                  I agree to receive text messages from Moment, including prompt notifications and partner activity alerts.
                </Label>
              </div>
              <Button type="submit" disabled={loading || !phone.trim()}>
                {loading ? "Saving..." : "Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
