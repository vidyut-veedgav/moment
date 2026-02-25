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
