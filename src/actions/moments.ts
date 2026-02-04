"use server";

import { getPartner } from "@/src/actions/auth";
import { prisma } from "@/src/lib/prisma/prisma";

export async function createMoment(partnershipId: string, promptId: string) {
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
  });
  if (!partnership) throw new Error("Partnership not found");

  // Verify this prompt is actually linked to this partnership
  const partnershipPrompt = await prisma.partnershipPrompt.findUnique({
    where: {
      partnership_id_prompt_id: {
        partnership_id: partnershipId,
        prompt_id: promptId,
      },
    },
  });
  if (!partnershipPrompt) throw new Error("Prompt not available for this partnership");

  return prisma.$transaction(async (tx) => {
    const moment = await tx.moment.create({
      data: {
        prompt_id: promptId,
        partnership_id: partnershipId,
      },
    });

    // Create a PENDING response slot for each partner
    await tx.response.createMany({
      data: [
        { responder_id: partnership.partner1_id, moment_id: moment.moment_id },
        { responder_id: partnership.partner2_id, moment_id: moment.moment_id },
      ],
    });

    return tx.moment.findUnique({
      where: { moment_id: moment.moment_id },
      include: {
        prompt: true,
        responses: { include: { responder: true } },
      },
    });
  });
}

export async function getMoments(partnershipId: string) {
  return prisma.moment.findMany({
    where: { partnership_id: partnershipId },
    include: {
      prompt: true,
      responses: { include: { responder: true } },
      reveal_statuses: true,
    },
    orderBy: { created_at: "desc" },
  });
}

export async function getMoment(momentId: string) {
  return prisma.moment.findUnique({
    where: { moment_id: momentId },
    include: {
      prompt: true,
      responses: { include: { responder: true } },
      reveal_statuses: true,
    },
  });
}
