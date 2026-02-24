"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";

export default function ReadyToRevealState({
  promptText,
  onReveal,
  loading,
}: {
  promptText: string;
  onReveal: () => void;
  loading: boolean;
}) {
  return (
    <motion.div
      className="w-full max-w-md text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl leading-snug">{promptText}</CardTitle>
          <CardDescription>Both of you have responded!</CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="lg"
              className="w-full h-14 text-lg rounded-2xl bg-amber-500 hover:bg-amber-500/90 text-white"
              onClick={onReveal}
              disabled={loading}
            >
              <motion.span
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {loading ? "Revealing..." : "Reveal Responses"}
              </motion.span>
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
