"use server";

import { getPartner } from "@/src/actions/auth";
import { prisma } from "@/lib/prisma/prisma";

export async function getTodaysMoment(partnershipId: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  return prisma.moment.findFirst({
    where: {
      partnership_id: partnershipId,
      created_at: { gte: startOfDay, lt: endOfDay },
    },
    include: {
      prompt: true,
      responses: { include: { responder: true } },
    },
  });
}

export async function getMoments(partnershipId: string) {
  return prisma.moment.findMany({
    where: { partnership_id: partnershipId },
    include: {
      prompt: true,
      responses: { include: { responder: true } },
    },
    orderBy: { created_at: "desc" },
  });
}

export async function resetMoment(momentId: string) {
  const partner = await getPartner();
  if (!partner) throw new Error("Not authenticated");

  return prisma.$transaction(async (tx) => {
    const moment = await tx.moment.findUnique({
      where: { moment_id: momentId },
      include: { responses: true },
    });
    if (!moment) throw new Error("Moment not found");

    // Verify caller belongs to this moment's partnership
    const partnership = await tx.partnership.findFirst({
      where: {
        partnership_id: moment.partnership_id,
        OR: [
          { partner1_id: partner.partner_id },
          { partner2_id: partner.partner_id },
        ],
      },
    });
    if (!partnership) throw new Error("Not authorized");

    await tx.response.updateMany({
      where: { moment_id: momentId },
      data: { status: "PENDING", content: null },
    });
    await tx.moment.update({
      where: { moment_id: momentId },
      data: { status: "PENDING" },
    });
  });
}

export async function getMoment(momentId: string) {
  return prisma.moment.findUnique({
    where: { moment_id: momentId },
    include: {
      prompt: true,
      responses: { include: { responder: true } },
    },
  });
}
