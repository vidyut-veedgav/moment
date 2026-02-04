"use server";

import { getPartner } from "@/src/actions/auth";
import { prisma } from "@/src/lib/prisma/prisma";

export async function createPartnership(partner2Id: string) {
  const partner = await getPartner();
  if (!partner) throw new Error("Not authenticated");

  // Check both orderings -- the unique constraint on the schema is only
  // (partner1_id, partner2_id), so (A,B) and (B,A) would both be allowed by the DB.
  const existing = await prisma.partnership.findFirst({
    where: {
      OR: [
        { partner1_id: partner.partner_id, partner2_id: partner2Id },
        { partner1_id: partner2Id, partner2_id: partner.partner_id },
      ],
    },
    include: { partner1: true, partner2: true },
  });

  if (existing) return existing;

  return prisma.partnership.create({
    data: {
      partner1_id: partner.partner_id,
      partner2_id: partner2Id,
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
