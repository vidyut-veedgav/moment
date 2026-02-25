import { getPartner } from "@/src/actions/auth";
import { getMyPartnership } from "@/src/actions/partnerships";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import OnboardingPage from "@/src/app/onboarding/onboarding-page";

export default async function Onboarding() {
  const partner = await getPartner();
  if (!partner) redirect("/");

  if (partner.phone) {
    const cookieStore = await cookies();
    const pendingInvite = cookieStore.get("pending_invite")?.value;

    if (pendingInvite) {
      cookieStore.delete("pending_invite");
      redirect(`/invite/${pendingInvite}`);
    }

    const partnership = await getMyPartnership();
    if (partnership) redirect("/home");
    redirect("/partnership");
  }

  return <OnboardingPage />;
}
