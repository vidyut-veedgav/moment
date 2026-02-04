"use server";

import { getPartner } from "@/src/actions/auth";
import { prisma } from "@/src/lib/prisma/prisma";

export async function submitResponse(momentId: string, content: string) {
  const partner = await getPartner();
  if (!partner) throw new Error("Not authenticated");

  if (!content.trim()) throw new Error("Response cannot be empty");

  return prisma.$transaction(async (tx) => {
    const response = await tx.response.findUnique({
      where: {
        responder_id_moment_id: {
          responder_id: partner.partner_id,
          moment_id: momentId,
        },
      },
    });

    if (!response) throw new Error("Response not found");
    if (response.status === "RESPONDED") throw new Error("Already responded");

    await tx.response.update({
      where: { response_id: response.response_id },
      data: { content, status: "RESPONDED" },
    });

    // Check if both partners have now responded
    const allResponses = await tx.response.findMany({
      where: { moment_id: momentId },
    });
    const allResponded = allResponses.every((r) => r.status === "RESPONDED");

    if (allResponded) {
      await tx.moment.update({
        where: { moment_id: momentId },
        data: { status: "BOTH_RESPONDED" },
      });

      // Create RevealStatus rows now that there's something to reveal
      await tx.revealStatus.createMany({
        data: allResponses.map((r) => ({
          partner_id: r.responder_id,
          moment_id: momentId,
        })),
      });
    }

    return tx.moment.findUnique({
      where: { moment_id: momentId },
      include: {
        prompt: true,
        responses: { include: { responder: true } },
        reveal_statuses: true,
      },
    });
  });
}

export async function getMyResponse(momentId: string) {
  const partner = await getPartner();
  if (!partner) throw new Error("Not authenticated");

  return prisma.response.findUnique({
    where: {
      responder_id_moment_id: {
        responder_id: partner.partner_id,
        moment_id: momentId,
      },
    },
  });
}
