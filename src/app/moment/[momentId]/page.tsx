import { getPartner } from "@/src/actions/auth";
import { getMyPartnership } from "@/src/actions/partnerships";
import { getMoment } from "@/src/actions/moments";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  const myRevealStatus = moment.reveal_statuses.find(
    (rs) => rs.partner_id === partner.partner_id
  );
  if (!myRevealStatus?.has_revealed) redirect("/home");

  const otherPartner =
    partnership.partner1_id === partner.partner_id
      ? partnership.partner2
      : partnership.partner1;

  const myResponse = moment.responses.find(
    (r) => r.responder_id === partner.partner_id
  );
  const partnerResponse = moment.responses.find(
    (r) => r.responder_id === otherPartner.partner_id
  );

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="flex items-center justify-between border-b px-6 py-4">
        <Link href="/home" className="text-xl font-bold">
          Moment
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/history" className="text-sm text-muted-foreground hover:text-foreground">
            History
          </Link>
          <Link href="/home" className="text-sm text-muted-foreground hover:text-foreground">
            Home
          </Link>
        </div>
      </nav>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-6 py-8">
        <h2 className="text-center text-lg font-semibold">
          {moment.prompt.content}
        </h2>
        <p className="text-sm text-muted-foreground">
          {new Date(moment.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">You said...</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{myResponse?.content}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {otherPartner.first_name} said...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{partnerResponse?.content}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Link href="/history">
            <Button variant="outline">Back to History</Button>
          </Link>
          <Link href="/home">
            <Button>Home</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
