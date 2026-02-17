import { getPartner, getPartnerById } from "@/src/actions/auth";
import { getMyPartnership } from "@/src/actions/partnerships";
import { redirect } from "next/navigation";
import InvitePage from "@/src/app/invite/[partnerId]/invite-page";

export default async function InvitePageRoute({
  params,
}: {
  params: Promise<{ partnerId: string }>;
}) {
  const { partnerId } = await params;
  const inviter = await getPartnerById(partnerId);

  if (!inviter) redirect("/");

  const currentPartner = await getPartner();
  const isAuthenticated = !!currentPartner;

  if (isAuthenticated) {
    const partnership = await getMyPartnership();
    if (partnership) redirect("/home");
  }

  return (
    <InvitePage
      inviterName={`${inviter.first_name} ${inviter.last_name}`.trim()}
      inviterPartnerId={inviter.partner_id}
      isAuthenticated={isAuthenticated}
    />
  );
}
