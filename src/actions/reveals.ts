"use server";

import { getPartner } from "@/src/actions/auth";
import { prisma } from "@/src/lib/prisma/prisma";

export async function revealMoment(momentId: string) {
  const partner = await getPartner();
  if (!partner) throw new Error("Not authenticated");

  return prisma.$transaction(async (tx) => {
    const moment = await tx.moment.findUnique({
      where: { moment_id: momentId },
    });
    if (!moment) throw new Error("Moment not found");

    // Already fully revealed -- return current state
    if (moment.status === "REVEALED") {
      return tx.moment.findUnique({
        where: { moment_id: momentId },
        include: {
          prompt: true,
          responses: { include: { responder: true } },
          reveal_statuses: true,
        },
      });
    }

    if (moment.status !== "BOTH_RESPONDED") {
      throw new Error("Not ready to reveal");
    }

    const revealStatus = await tx.revealStatus.findUnique({
      where: {
        partner_id_moment_id: {
          partner_id: partner.partner_id,
          moment_id: momentId,
        },
      },
    });
    if (!revealStatus) throw new Error("Reveal status not found");

    if (!revealStatus.has_revealed) {
      await tx.revealStatus.update({
        where: {
          partner_id_moment_id: {
            partner_id: partner.partner_id,
            moment_id: momentId,
          },
        },
        data: { has_revealed: true },
      });
    }

    // Check if both partners have now revealed
    const allRevealStatuses = await tx.revealStatus.findMany({
      where: { moment_id: momentId },
    });
    if (allRevealStatuses.every((rs) => rs.has_revealed)) {
      await tx.moment.update({
        where: { moment_id: momentId },
        data: { status: "REVEALED" },
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

export async function getRevealStatus(momentId: string) {
  const partner = await getPartner();
  if (!partner) throw new Error("Not authenticated");

  return prisma.revealStatus.findUnique({
    where: {
      partner_id_moment_id: {
        partner_id: partner.partner_id,
        moment_id: momentId,
      },
    },
  });
}
