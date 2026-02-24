"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PulsingDots from "@/components/pulsing-dots";
import { motion } from "framer-motion";

export default function WaitingState({
  promptText,
  partnerName,
}: {
  promptText: string;
  partnerName: string;
}) {
  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-secondary/30 text-center">
        <CardHeader>
          <CardTitle className="text-2xl leading-snug">{promptText}</CardTitle>
          <CardDescription>Your response is in</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <div className="py-2">
            <PulsingDots />
          </div>
          <p className="text-sm text-muted-foreground">
            Waiting for {partnerName} to share their thoughts...
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
