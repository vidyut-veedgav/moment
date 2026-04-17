import { getPartner } from "@/src/actions/auth";
import { getMyPartnership } from "@/src/actions/partnerships";
import { redirect } from "next/navigation";
import OnboardingPage from "@/src/app/onboarding/onboarding-page";

export default async function Onboarding({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const partner = await getPartner();
  if (!partner) redirect("/");

  if (partner.phone) {
    const { invite } = await searchParams;

    if (invite) {
      redirect(`/invite/${invite}`);
    }

    const partnership = await getMyPartnership();
    if (partnership) redirect("/home");
    redirect("/partnership");
  }

  return <OnboardingPage />;
}
