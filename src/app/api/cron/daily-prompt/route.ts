import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { sendSMS } from "@/lib/twilio/sms";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const partnerships = await prisma.partnership.findMany({
    include: { partner1: true, partner2: true },
  });

  let momentsCreated = 0;
  let notificationsSent = 0;

  for (const partnership of partnerships) {
    // Skip if a moment already exists today
    const existing = await prisma.moment.findFirst({
      where: {
        partnership_id: partnership.partnership_id,
        created_at: { gte: startOfDay, lt: endOfDay },
      },
    });

    if (existing) continue;

    // Find next unused prompt
    const usedPromptIds = await prisma.moment.findMany({
      where: { partnership_id: partnership.partnership_id },
      select: { prompt_id: true },
    });
    const usedIds = usedPromptIds.map((m) => m.prompt_id);

    const nextPrompt = await prisma.partnershipPrompt.findFirst({
      where: {
        partnership_id: partnership.partnership_id,
        prompt_id: usedIds.length > 0 ? { notIn: usedIds } : undefined,
      },
      include: { prompt: true },
      orderBy: { created_at: "asc" },
    });

    if (!nextPrompt) continue;

    // Create moment + response slots
    await prisma.$transaction(async (tx) => {
      const moment = await tx.moment.create({
        data: {
          prompt_id: nextPrompt.prompt_id,
          partnership_id: partnership.partnership_id,
        },
      });

      await tx.response.createMany({
        data: [
          { responder_id: partnership.partner1_id, moment_id: moment.moment_id },
          { responder_id: partnership.partner2_id, moment_id: moment.moment_id },
        ],
      });
    });

    momentsCreated++;

    // Send SMS to both partners
    for (const p of [partnership.partner1, partnership.partner2]) {
      if (p.phone) {
        await sendSMS(p.phone, "Your daily Moment prompt is ready!");
        notificationsSent++;
      }
    }
  }

  return NextResponse.json({ momentsCreated, notificationsSent });
}
