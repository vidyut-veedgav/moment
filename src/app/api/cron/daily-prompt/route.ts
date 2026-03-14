import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { createMomentForPartnership } from "@/src/actions/moments";

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
    try {
      // Idempotency: skip if today's moment already exists (e.g. cron ran twice)
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

      await createMomentForPartnership(partnership, nextPrompt);
      momentsCreated++;
      notificationsSent += [partnership.partner1, partnership.partner2].filter(
        (p) => p.phone
      ).length;
    } catch (err) {
      console.error(`Failed to process partnership ${partnership.partnership_id}:`, err);
    }
  }

  return NextResponse.json({ momentsCreated, notificationsSent });
}
