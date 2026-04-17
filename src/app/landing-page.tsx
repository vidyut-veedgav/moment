"use client";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.png";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ENTRIES = [
  { day: 1,   prompt: "What's something you've been afraid to tell me?" },
  { day: 30,  prompt: "What's a memory of us that always makes you smile?" },
  { day: 70,  prompt: "What's one thing you wish I understood better about you?" },
  { day: 120, prompt: "What does a perfect day with me look like?" },
  { day: 200, prompt: "What's something small I do that means a lot to you?" },
];

export default function LandingPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % ENTRIES.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-8 text-center">
        {/* Logo — the centerpiece */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={logo}
            alt="Moment"
            width={200}
            height={200}
            priority
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
        >
          <p className="text-4xl text-muted-foreground max-w-[16ch] leading-tight font-light">
            Let the{" "}
            <span className="text-primary font-bold">Moment</span>
            {" "}grow with you
          </p>
        </motion.div>

        {/* Sign in */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
        >
          <Button
            size="lg"
            className="h-12 px-8 rounded-full text-base"
            onClick={() => router.push("/auth/signin")}
          >
            Get Started
          </Button>
        </motion.div>

        {/* Prompt preview */}
        <motion.div
          className="relative w-full max-w-xs"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65, ease: "easeOut" }}
        >
          <div className="rounded-2xl border border-border/60 bg-card px-6 py-5 text-left shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                Today&apos;s prompt
              </p>
              <AnimatePresence mode="wait">
                <motion.span
                  key={index}
                  className="text-[11px] font-semibold text-primary/70"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  Day {ENTRIES[index].day}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="relative min-h-[3.5rem]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={index}
                  className="text-lg font-medium leading-snug"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                >
                  {ENTRIES[index].prompt}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="mt-4 flex gap-2">
              <div className="h-8 flex-1 rounded-lg bg-muted/60" />
              <div className="h-8 w-8 rounded-lg bg-primary/10" />
            </div>
          </div>
          {/* Fade out at the bottom to hint there's more */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 rounded-b-2xl bg-gradient-to-t from-background to-transparent" />
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        className="absolute bottom-8 flex gap-5 text-xs text-muted-foreground/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        <Link href="/terms" className="hover:text-muted-foreground transition-colors">
          Terms
        </Link>
        <Link href="/privacy" className="hover:text-muted-foreground transition-colors">
          Privacy
        </Link>
      </motion.footer>
    </div>
  );
}
