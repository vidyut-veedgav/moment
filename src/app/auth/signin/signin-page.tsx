"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signInWithEmail, signUpWithEmail } from "@/src/actions/auth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.png";

type Mode = "signup" | "signin";

export default function SignInPage() {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (mode === "signup" && password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image src={logo} alt="Moment" width={64} height={64} priority />
          </Link>
        </div>

        <div className="rounded-2xl border bg-card shadow-xl p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1 text-center">
            <h1 className="font-display font-bold text-2xl tracking-tight">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "signup"
                ? "Start your Moment journey"
                : "Sign in to continue"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 placeholder:text-muted-foreground/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 placeholder:text-muted-foreground/30"
              />
            </div>

            <div
              className="grid transition-[grid-template-rows] duration-200 ease-in-out"
              style={{ gridTemplateRows: mode === "signup" ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-1.5 pb-px">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 placeholder:text-muted-foreground/30"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-11 rounded-xl text-base mt-1"
              disabled={loading}
            >
              {loading
                ? mode === "signup"
                  ? "Creating account…"
                  : "Signing in…"
                : mode === "signup"
                ? "Create account"
                : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="text-primary font-medium hover:underline"
                >
                  Create one
                </button>
              </>
            )}
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground/50">
            <div className="flex-1 h-px bg-border" />
            or
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-11 rounded-xl gap-2.5"
            disabled={googleLoading}
            onClick={() => {
              setGoogleLoading(true);
              signIn();
            }}
          >
            <Image
              src="/icons/Google__G__logo.svg.png"
              alt="Google"
              width={18}
              height={18}
              className="shrink-0"
            />
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </Button>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        className="absolute bottom-8 flex gap-5 text-xs text-muted-foreground/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
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
