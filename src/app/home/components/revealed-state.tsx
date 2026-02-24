"use client";

import ResponseComparison from "@/components/response-comparison";
import { motion } from "framer-motion";

export default function RevealedState({
  promptText,
  myContent,
  partnerName,
  partnerContent,
}: {
  promptText: string;
  myContent: string | null;
  partnerName: string;
  partnerContent: string | null;
}) {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <motion.h2
        className="font-display font-bold text-center text-2xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {promptText}
      </motion.h2>
      <ResponseComparison
        myContent={myContent}
        partnerName={partnerName}
        partnerContent={partnerContent}
      />
    </div>
  );
}
