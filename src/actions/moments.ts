"use server";

import { getPartner } from "@/src/actions/auth";
import { prisma } from "@/lib/prisma/prisma";
import { sendSMS } from "@/lib/twilio/sms";

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

type PartnershipWithPartners = {
  partnership_id: string;
  partner1_id: string;
  partner2_id: string;
  partner1: { phone: string | null };
  partner2: { phone: string | null };
};

type PartnershipPromptWithPrompt = {
  prompt_id: string;
  prompt: { content: string };
};

export async function createMomentForPartnership(
  partnership: PartnershipWithPartners,
  partnershipPrompt: PartnershipPromptWithPrompt
) {
  const moment = await prisma.$transaction(async (tx) => {
    const created = await tx.moment.create({
      data: {
        prompt_id: partnershipPrompt.prompt_id,
        partnership_id: partnership.partnership_id,
      },
    });

    await tx.response.createMany({
      data: [
        { responder_id: partnership.partner1_id, moment_id: created.moment_id },
        { responder_id: partnership.partner2_id, moment_id: created.moment_id },
      ],
    });

    return tx.moment.findUnique({
      where: { moment_id: created.moment_id },
      include: { prompt: true, responses: { include: { responder: true } } },
    });
  });

  for (const p of [partnership.partner1, partnership.partner2]) {
    if (p.phone) {
      sendSMS(p.phone, `Your daily Moment is ready: "${partnershipPrompt.prompt.content}"`);
    }
  }

  return moment;
}

export async function createDevMoment(partnershipId: string) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Dev only");
  }

  const partner = await getPartner();
  if (!partner) throw new Error("Not authenticated");

  const partnership = await prisma.partnership.findFirst({
    where: {
      partnership_id: partnershipId,
      OR: [
        { partner1_id: partner.partner_id },
        { partner2_id: partner.partner_id },
      ],
    },
    include: { partner1: true, partner2: true },
  });
  if (!partnership) throw new Error("Not authorized");

  const partnershipPrompts = await prisma.partnershipPrompt.findMany({
    where: { partnership_id: partnershipId },
    include: { prompt: true },
  });
  if (partnershipPrompts.length === 0) throw new Error("No prompts available");

  const randomPrompt =
    partnershipPrompts[Math.floor(Math.random() * partnershipPrompts.length)];

  return createMomentForPartnership(partnership, randomPrompt);
}

export async function deleteDevMoment(momentId: string) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Dev only");
  }

  const partner = await getPartner();
  if (!partner) throw new Error("Not authenticated");

  return prisma.$transaction(async (tx) => {
    const moment = await tx.moment.findUnique({
      where: { moment_id: momentId },
    });
    if (!moment) throw new Error("Moment not found");

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

    await tx.response.deleteMany({ where: { moment_id: momentId } });
    await tx.moment.delete({ where: { moment_id: momentId } });
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
