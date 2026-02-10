"use server";

import { getPartner } from "@/src/actions/auth";
import { prisma } from "@/lib/prisma/prisma";

export async function generateInviteLink() {
  const partner = await getPartner();
  if (!partner) throw new Error("Not authenticated");

  return `${process.env.NEXT_PUBLIC_APP_URL}/invite/${partner.partner_id}`;
}

export async function acceptInvite(inviterPartnerId: string) {
  const partner = await getPartner();
  if (!partner) throw new Error("Not authenticated");

  if (partner.partner_id === inviterPartnerId) {
    throw new Error("You cannot invite yourself");
  }

  // Verify inviter exists and has no existing partnership
  const inviter = await prisma.partner.findUnique({
    where: { partner_id: inviterPartnerId },
  });
  if (!inviter) throw new Error("Invalid invite link");

  const inviterPartnership = await prisma.partnership.findFirst({
    where: {
      OR: [
        { partner1_id: inviterPartnerId },
        { partner2_id: inviterPartnerId },
      ],
    },
  });
  if (inviterPartnership) throw new Error("This invite is no longer valid");

  // Current user must not already have a partnership
  const myPartnership = await prisma.partnership.findFirst({
    where: {
      OR: [
        { partner1_id: partner.partner_id },
        { partner2_id: partner.partner_id },
      ],
    },
  });
  if (myPartnership) throw new Error("You already have a partner");

  return prisma.partnership.create({
    data: {
      partner1_id: inviterPartnerId,
      partner2_id: partner.partner_id,
    },
    include: {
      partner1: true,
      partner2: true,
    },
  });
}

export async function getPartnership(partnershipId: string) {
  return prisma.partnership.findUnique({
    where: { partnership_id: partnershipId },
    include: {
      partner1: true,
      partner2: true,
    },
  });
}

export async function getMyPartnership() {
  const partner = await getPartner();
  if (!partner) return null;

  return prisma.partnership.findFirst({
    where: {
      OR: [
        { partner1_id: partner.partner_id },
        { partner2_id: partner.partner_id },
      ],
    },
    include: {
      partner1: true,
      partner2: true,
    },
  });
}
