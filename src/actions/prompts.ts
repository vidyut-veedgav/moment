"use server";

import { getPartner } from "@/src/actions/auth";
import { prisma } from "@/lib/prisma/prisma";

const DEFAULT_PROMPTS = [
  "What made you smile today?",
  "What are you looking forward to tomorrow?",
  "What's something you learned this week?",
  "Describe your perfect day.",
  "What's a small thing that meant a lot to you recently?",
];

export async function seedDefaultPrompts(partnershipId: string) {
  await prisma.$transaction(async (tx) => {
    for (const content of DEFAULT_PROMPTS) {
      const prompt =
        (await tx.prompt.findFirst({ where: { content } })) ??
        (await tx.prompt.create({ data: { content } }));

      await tx.partnershipPrompt.create({
        data: {
          partnership_id: partnershipId,
          prompt_id: prompt.prompt_id,
          is_default: true,
        },
      });
    }
  });
}

export async function getPrompts(partnershipId: string) {
  return prisma.partnershipPrompt.findMany({
    where: { partnership_id: partnershipId },
    include: { prompt: true },
    orderBy: { created_at: "asc" },
  });
}

export async function addPrompt(partnershipId: string, promptId: string) {
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

  return prisma.partnershipPrompt.create({
    data: {
      partnership_id: partnershipId,
      prompt_id: promptId,
      is_default: false,
    },
    include: { prompt: true },
  });
}
