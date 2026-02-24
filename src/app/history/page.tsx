import { getPartner } from "@/src/actions/auth";
import { getMyPartnership } from "@/src/actions/partnerships";
import { getMoments } from "@/src/actions/moments";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FadeIn from "@/components/fade-in";
import AppNav from "@/components/app-nav";
import ThemeToggle from "@/components/theme-toggle";

export default async function HistoryPage() {
  const partner = await getPartner();
  if (!partner) redirect("/");

  const partnership = await getMyPartnership();
  if (!partnership) redirect("/partnership");

  const moments = await getMoments(partnership.partnership_id);
  const revealedMoments = moments.filter((m) =>
    m.reveal_statuses.some(
      (rs) => rs.partner_id === partner.partner_id && rs.has_revealed
    )
  );

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav
        rightSlot={
          <>
            <Link
              href="/home"
              className="bg-secondary rounded-full px-4 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/70"
            >
              Home
            </Link>
            <ThemeToggle />
          </>
        }
      />

      <main className="mx-auto w-full max-w-2xl px-6 py-8">
        <FadeIn>
          <h1 className="font-display font-bold text-3xl mb-8">History</h1>
        </FadeIn>

        {revealedMoments.length === 0 ? (
          <FadeIn delay={0.1}>
            <p className="text-muted-foreground">No moments yet.</p>
          </FadeIn>
        ) : (
          <div className="grid gap-4">
            {revealedMoments.map((moment, i) => (
              <FadeIn key={moment.moment_id} delay={0.05 + i * 0.05}>
                <Link href={`/moment/${moment.moment_id}`}>
                  <Card className="transition-all hover:shadow-lg hover:scale-[1.01]">
                    <CardHeader>
                      <CardTitle className="text-base line-clamp-2">
                        {moment.prompt.content}
                      </CardTitle>
                      <CardDescription>
                        {new Date(moment.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </FadeIn>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
