import { getPartner } from "@/src/actions/auth";
import { getMyPartnership } from "@/src/actions/partnerships";
import { getTodaysMoment } from "@/src/actions/moments";
import { redirect } from "next/navigation";
import HomePage from "@/src/app/home/home-page";

export default async function HomePageRoute() {
  const partner = await getPartner();
  if (!partner) redirect("/");

  const partnership = await getMyPartnership();
  if (!partnership) redirect("/partnership");

  const moment = await getTodaysMoment(partnership.partnership_id);

  if (!moment) {
    return (
      <HomePage
        state="no-moment"
        partnerName=""
        momentId=""
        promptText=""
        myResponse={null}
        partnerResponse={null}
        myRevealStatus={null}
        partnerRevealStatus={null}
      />
    );
  }

  // Determine the other partner
  const otherPartner =
    partnership.partner1_id === partner.partner_id
      ? partnership.partner2
      : partnership.partner1;
  const partnerName = `${otherPartner.first_name}`;

  // Derive from already-fetched moment data — no extra DB calls needed
  const myResponse = moment.responses.find(
    (r) => r.responder_id === partner.partner_id
  ) ?? null;
  const partnerResponse = moment.responses.find(
    (r) => r.responder_id === otherPartner.partner_id
  ) ?? null;
  const myRevealStatus = moment.reveal_statuses.find(
    (rs) => rs.partner_id === partner.partner_id
  ) ?? null;
  const partnerRevealStatus = moment.reveal_statuses.find(
    (rs) => rs.partner_id === otherPartner.partner_id
  ) ?? null;

  // Determine state
  let state: "no-moment" | "needs-response" | "waiting-for-partner" | "ready-to-reveal" | "revealed";
  if (!myResponse || myResponse.status === "PENDING") {
    state = "needs-response";
  } else if (moment.status === "PENDING") {
    state = "waiting-for-partner";
  } else if (myRevealStatus && myRevealStatus.has_revealed) {
    state = "revealed";
  } else {
    state = "ready-to-reveal";
  }

  return (
    <HomePage
      state={state}
      partnerName={partnerName}
      momentId={moment.moment_id}
      promptText={moment.prompt.content}
      myResponse={myResponse}
      partnerResponse={partnerResponse}
      myRevealStatus={myRevealStatus}
      partnerRevealStatus={partnerRevealStatus}
    />
  );
}
