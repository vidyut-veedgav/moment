import { getPartner } from "@/src/actions/auth";
import { getMyPartnership } from "@/src/actions/partnerships";
import { redirect } from "next/navigation";
import PartnershipPage from "@/src/app/partnership/partnership-page";

export default async function PartnershipPageRoute() {
  const partner = await getPartner();
  if (!partner) redirect("/");

  const partnership = await getMyPartnership();
  if (partnership) redirect("/home");

  return <PartnershipPage partnerId={partner.partner_id} />;
}
