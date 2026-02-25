"use server";

import { getPartner } from "@/src/actions/auth";
import { prisma } from "@/lib/prisma/prisma";

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
        },
      });
    }

    if (moment.status !== "BOTH_RESPONDED") {
      throw new Error("Not ready to reveal");
    }

    const myResponse = await tx.response.findUnique({
      where: {
        responder_id_moment_id: {
          responder_id: partner.partner_id,
          moment_id: momentId,
        },
      },
    });
    if (!myResponse) throw new Error("Response not found");

    if (myResponse.status === "RESPONDED") {
      await tx.response.update({
        where: { response_id: myResponse.response_id },
        data: { status: "REVEALED" },
      });
    }

    // Check if all responses are now revealed
    const allResponses = await tx.response.findMany({
      where: { moment_id: momentId },
    });
    if (allResponses.every((r) => r.status === "REVEALED")) {
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
      },
    });
  });
}
