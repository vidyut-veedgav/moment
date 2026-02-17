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
      <nav className="flex items-center justify-between border-b px-6 py-4">
        <Link href="/home" className="text-xl font-bold">
          Moment
        </Link>
        <Link href="/home" className="text-sm text-muted-foreground hover:text-foreground">
          Home
        </Link>
      </nav>

      <main className="mx-auto w-full max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold">History</h1>

        {revealedMoments.length === 0 ? (
          <p className="text-muted-foreground">No moments yet.</p>
        ) : (
          <div className="grid gap-4">
            {revealedMoments.map((moment) => (
              <Link key={moment.moment_id} href={`/moment/${moment.moment_id}`}>
                <Card className="transition-colors hover:bg-muted/50">
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
