import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/prisma";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/`);
  }

  // Find or create Partner record
  let partner = await prisma.partner.findUnique({
    where: { auth_id: user.id },
  });

  if (!partner) {
    partner = await prisma.partner.create({
      data: {
        auth_id: user.id,
        first_name: user.user_metadata.given_name || user.user_metadata.full_name?.split(" ")[0] || "User",
        last_name: user.user_metadata.family_name || user.user_metadata.full_name?.split(" ").slice(1).join(" ") || "",
      },
    });
  }

  // Check for pending invite cookie
  const cookieStore = await cookies();
  const pendingInvite = cookieStore.get("pending_invite")?.value;

  if (pendingInvite) {
    cookieStore.delete("pending_invite");
    return NextResponse.redirect(`${origin}/invite/${pendingInvite}`);
  }

  // Check if partner has a partnership
  const partnership = await prisma.partnership.findFirst({
    where: {
      OR: [
        { partner1_id: partner.partner_id },
        { partner2_id: partner.partner_id },
      ],
    },
  });

  if (partnership) {
    return NextResponse.redirect(`${origin}/home`);
  }

  return NextResponse.redirect(`${origin}/partnership`);
}
