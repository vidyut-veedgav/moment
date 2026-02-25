"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "@/src/actions/auth";
import { motion } from "framer-motion";
import Image from "next/image";

const features = [
  { num: "01", title: "Respond", desc: "Answer a daily prompt honestly and independently" },
  { num: "02", title: "Reveal", desc: "See each other's answers at the same time" },
  { num: "03", title: "Connect", desc: "Discover new things about each other every day" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-20 px-6 pt-32 pb-20">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <h1 className="font-display font-bold text-8xl tracking-tight sm:text-9xl">
          Moment
        </h1>
        <p className="text-sm tracking-widest uppercase text-muted-foreground">
          share moments that matter
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      >
        <Button
          size="lg"
          className="h-14 px-12 text-lg rounded-2xl"
          onClick={() => signIn()}
        >
          <Image
            src="/icons/Google__G__logo.svg.png"
            alt="Google"
            width={20}
            height={20}
            className="shrink-0"
          />
          Get Started
        </Button>
      </motion.div>

      <div className="flex w-full max-w-2xl flex-col gap-10 sm:flex-row sm:gap-16 sm:justify-center">
        {features.map((f, i) => (
          <motion.div
            key={f.num}
            className="flex flex-col items-center gap-2 text-center sm:flex-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.15, ease: "easeOut" }}
          >
            <span className="font-display font-bold text-4xl text-primary/60">
              {f.num}
            </span>
            <span className="text-lg font-medium">{f.title}</span>
            <span className="text-sm text-muted-foreground leading-relaxed">
              {f.desc}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
