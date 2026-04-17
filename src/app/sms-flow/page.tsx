"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.png";

export default function SmsFlowPage() {
  const [phone, setPhone] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg flex flex-col gap-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/">
            <Image src={logo} alt="Moment" width={56} height={56} priority />
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border bg-card shadow-xl p-10 flex flex-col gap-7">
          {/* Icon + heading */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-display font-bold text-2xl tracking-tight">
                SMS Notifications
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Add your phone number and we&apos;ll let you know when your daily prompt is ready and when your partner has responded.
              </p>
            </div>
          </div>

          {/* Phone input */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 text-base text-center tracking-wide"
            />
          </div>

          {/* SMS consent */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="sms-consent"
              checked={smsConsent}
              onCheckedChange={(checked) => setSmsConsent(checked === true)}
              className="mt-1 shrink-0"
            />
            <Label
              htmlFor="sms-consent"
              className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
            >
              By checking this box, I agree to receive recurring SMS text notifications from Moment (ourdailymoment.com), including daily prompt releases and partner activity alerts. Message and data rates may apply. Reply STOP to opt out at any time. Message frequency varies. View our Terms of Service and Privacy Policy below.
            </Label>
          </div>

          {/* Submit */}
          <Button
            type="button"
            size="lg"
            className="h-12 rounded-xl text-base"
            disabled={!phone.trim() || !smsConsent}
          >
            Continue
          </Button>
        </div>

        {/* Terms / Privacy */}
        <div className="flex justify-center gap-6 text-sm text-muted-foreground">
          <Link href="/terms" className="underline hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="underline hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
