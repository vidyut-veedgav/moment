import { getPartner } from "@/src/actions/auth";
import { getMyPartnership } from "@/src/actions/partnerships";
import { getTodaysMoment, getMoment } from "@/src/actions/moments";
import { getMyResponse } from "@/src/actions/responses";
import { getRevealStatus } from "@/src/actions/reveals";
import { redirect } from "next/navigation";
import HomePage from "@/src/app/home/home-page";

export default async function HomePageRoute() {
  const partner = await getPartner();
  if (!partner) redirect("/");

  const partnership = await getMyPartnership();
  if (!partnership) redirect("/partnership");

  const todaysMoment = await getTodaysMoment(partnership.partnership_id);

  if (!todaysMoment) {
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

  // Re-fetch with consistent shape that includes reveal_statuses
  const moment = await getMoment(todaysMoment.moment_id);
  if (!moment) redirect("/");

  const myResponse = await getMyResponse(moment.moment_id);

  // Determine the other partner
  const otherPartner =
    partnership.partner1_id === partner.partner_id
      ? partnership.partner2
      : partnership.partner1;
  const partnerName = `${otherPartner.first_name}`;

  const partnerResponse = moment.responses.find(
    (r) => r.responder_id === otherPartner.partner_id
  );

  let myRevealStatus = null;
  let partnerRevealStatus = null;

  if (moment.status === "BOTH_RESPONDED" || moment.status === "REVEALED") {
    myRevealStatus = await getRevealStatus(moment.moment_id);
    partnerRevealStatus = moment.reveal_statuses.find(
      (rs) => rs.partner_id === otherPartner.partner_id
    ) ?? null;
  }

  // Determine state
  let state: "no-moment" | "needs-response" | "waiting-for-partner" | "ready-to-reveal" | "waiting-for-partner-reveal" | "revealed";
  if (!myResponse || myResponse.status === "PENDING") {
    state = "needs-response";
  } else if (moment.status === "PENDING") {
    state = "waiting-for-partner";
  } else if (moment.status === "REVEALED") {
    state = "revealed";
  } else if (myRevealStatus && myRevealStatus.has_revealed) {
    state = "waiting-for-partner-reveal";
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
      partnerResponse={partnerResponse ?? null}
      myRevealStatus={myRevealStatus}
      partnerRevealStatus={partnerRevealStatus}
    />
  );
}
