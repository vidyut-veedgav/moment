"use client";

import { motion } from "framer-motion";

export default function NoMomentState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <h2 className="font-display font-bold text-3xl mb-2">
        You&apos;re all caught up
      </h2>
      <p className="text-muted-foreground">
        No prompts waiting for you. Enjoy the moment.
      </p>
    </motion.div>
  );
}
