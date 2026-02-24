"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FadeIn from "@/components/fade-in";

export default function ResponseComparison({
  myContent,
  partnerName,
  partnerContent,
}: {
  myContent: string | null;
  partnerName: string;
  partnerContent: string | null;
}) {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
      <FadeIn delay={0.15}>
        <Card className="overflow-hidden">
          <div className="h-1.5 bg-primary/30" />
          <CardHeader>
            <CardTitle className="text-base">You said...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed">{myContent}</p>
          </CardContent>
        </Card>
      </FadeIn>
      <FadeIn delay={0.3}>
        <Card className="overflow-hidden">
          <div className="h-1.5 bg-secondary" />
          <CardHeader>
            <CardTitle className="text-base">{partnerName} said...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed">{partnerContent}</p>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
