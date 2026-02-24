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
import { motion } from "framer-motion";

export default function NeedsResponseState({
  promptText,
  responseText,
  onResponseChange,
  onSubmit,
  loading,
}: {
  promptText: string;
  responseText: string;
  onResponseChange: (text: string) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl leading-snug">{promptText}</CardTitle>
          <CardDescription>Share what comes to mind</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Textarea
            placeholder="Type your response..."
            value={responseText}
            onChange={(e) => onResponseChange(e.target.value)}
            rows={4}
          />
          <Button
            className="w-full"
            size="lg"
            onClick={onSubmit}
            disabled={loading || !responseText.trim()}
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
