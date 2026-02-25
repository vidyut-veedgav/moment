import { getPartner } from "@/src/actions/auth";
import { getMyPartnership } from "@/src/actions/partnerships";
import { redirect } from "next/navigation";
import LandingPage from "@/src/app/landing-page";

export default async function Home() {
  const partner = await getPartner();

  if (partner) {
    if (!partner.phone) redirect("/onboarding");
    const partnership = await getMyPartnership();
    if (partnership) redirect("/home");
    redirect("/partnership");
  }

  return <LandingPage />;
}
