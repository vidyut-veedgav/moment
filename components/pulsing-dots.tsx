"use client";

import { motion } from "framer-motion";

const sizes = { sm: "h-1.5 w-1.5", md: "h-2 w-2" } as const;

export default function PulsingDots({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${sizes[size]} rounded-full bg-primary/40`}
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
