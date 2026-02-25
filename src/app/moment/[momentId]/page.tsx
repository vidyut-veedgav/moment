import { getPartner } from "@/src/actions/auth";
import { getMyPartnership } from "@/src/actions/partnerships";
import { getMoment } from "@/src/actions/moments";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/fade-in";
import AppNav from "@/components/app-nav";
import ThemeToggle from "@/components/theme-toggle";
import ResponseComparison from "@/components/response-comparison";

export default async function MomentDetailPage({
  params,
}: {
  params: Promise<{ momentId: string }>;
}) {
  const { momentId } = await params;

  const partner = await getPartner();
  if (!partner) redirect("/");

  const partnership = await getMyPartnership();
  if (!partnership) redirect("/partnership");

  const moment = await getMoment(momentId);
  if (!moment) redirect("/home");

  const myResponse = moment.responses.find(
    (r) => r.responder_id === partner.partner_id
  );
  if (myResponse?.status !== "REVEALED") redirect("/home");

  const otherPartner =
    partnership.partner1_id === partner.partner_id
      ? partnership.partner2
      : partnership.partner1;

  const partnerResponse = moment.responses.find(
    (r) => r.responder_id === otherPartner.partner_id
  );

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav
        rightSlot={
          <>
            <Link
              href="/history"
              className="bg-secondary rounded-full px-4 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/70"
            >
              History
            </Link>
            <ThemeToggle />
            <Link
              href="/home"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
          </>
        }
      />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-6 py-8">
        <FadeIn>
          <h2 className="font-display font-bold text-center text-2xl">
            {moment.prompt.content}
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-sm text-muted-foreground">
            {new Date(moment.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </FadeIn>

        <ResponseComparison
          myContent={myResponse?.content ?? null}
          partnerName={otherPartner.first_name}
          partnerContent={partnerResponse?.content ?? null}
        />

        <FadeIn delay={0.35}>
          <div className="flex gap-4">
            <Link href="/history">
              <Button variant="outline">Back to History</Button>
            </Link>
            <Link href="/home">
              <Button>Home</Button>
            </Link>
          </div>
        </FadeIn>
      </main>
    </div>
  );
}
