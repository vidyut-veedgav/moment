"use server";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/prisma";

export async function signIn() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/");
  }

  redirect(data.url);
}

async function redirectAfterEmailAuth(authId: string) {
  let partner = await prisma.partner.findUnique({ where: { auth_id: authId } });
  if (!partner) return; // shouldn't happen — caller must upsert first

  if (!partner.phone) {
    redirect("/onboarding");
  }

  const partnership = await prisma.partnership.findFirst({
    where: {
      OR: [{ partner1_id: partner.partner_id }, { partner2_id: partner.partner_id }],
    },
  });

  redirect(partnership ? "/home" : "/partnership");
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Sign up failed. Please try again.");

  const firstName = email.split("@")[0];

  await prisma.partner.upsert({
    where: { auth_id: data.user.id },
    update: {},
    create: { auth_id: data.user.id, first_name: firstName, last_name: "" },
  });

  await redirectAfterEmailAuth(data.user.id);
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Sign in failed. Please try again.");

  await prisma.partner.upsert({
    where: { auth_id: data.user.id },
    update: {},
    create: {
      auth_id: data.user.id,
      first_name: data.user.email?.split("@")[0] ?? "User",
      last_name: "",
    },
  });

  await redirectAfterEmailAuth(data.user.id);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export const getPartner = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;

  return prisma.partner.findUnique({
    where: { auth_id: user.id },
  });
});

export async function updatePhone(phone: string) {
  const partner = await getPartner();
  if (!partner) throw new Error("Not authenticated");

  if (!/^\+[1-9]\d{1,14}$/.test(phone)) {
    throw new Error("Invalid phone number format");
  }

  return prisma.partner.update({
    where: { partner_id: partner.partner_id },
    data: { phone },
  });
}

export async function getPartnerById(partnerId: string) {
  return prisma.partner.findUnique({
    where: { partner_id: partnerId },
    select: { partner_id: true, first_name: true, last_name: true },
  });
}
