import Link from "next/link";
import { CoastalPageShell } from "@/components/coastal/page-shell";
import { PageHero } from "@/components/beachmag/interior-parts";
import { getPageSEO } from "@/lib/seo";

export const revalidate = 60;

// Google Calendar appointment schedule, embedded inline. In Calendar: open the
// schedule → Share → Website embed → Inline, and paste the iframe's src here
// (https://calendar.google.com/calendar/appointments/schedules/…?gv=true).
// Until it's set, the page points people at /contact instead.
// Share link: https://calendar.app.google/h9oaxhkZPt28rqEd8
const BOOKING_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0eGlpqT2RsH-3c6yd0SgzSNDY3PeSVCazfKX0N1mc18Jp-7i_45iR6stKtkjNE0ZKfUYWoFqdJ?gv=true";

export async function generateMetadata() {
  return await getPageSEO("/lets-meet");
}

export default function LetsMeetPage() {
  return (
    <CoastalPageShell>
      <PageHero
        kicker="PICK A TIME"
        title={<>Let’s<br /><em>meet up.</em></>}
        intro="Grab a spot on my calendar for a video call about a project, a website that needs help, or a role on your team. Times show in your time zone."
        path="/conferences"
        caption="Meet me at the end of the pier. ↙"
      />
      <div className="section-rule">
        <p>OPEN TIMES</p>
        <p>VIDEO CALL / GOOGLE MEET</p>
      </div>
      <div className="contact-grid">
        <section className="contact-letter meet-letter" aria-labelledby="meet-title">
          <p className="page-kicker">TO: CHRIS LANE JONES</p>
          <h2 id="meet-title">Pick a day,<br />pick a time.</h2>
          {BOOKING_URL ? (
            <>
              <p>Choose an open slot and Google sends us both an invite with the Meet link.</p>
              <iframe className="meet-frame" src={BOOKING_URL} title="Open times on Chris Lane Jones’s calendar" />
              <p className="meet-fallback">
                Calendar not loading? <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">Open it in a new tab ↗</a>
              </p>
            </>
          ) : (
            <>
              <p>The calendar is still getting set up. Send me a note with a few times that work and I’ll get back to you.</p>
              <Link className="action-link" href="/contact">Send a message <span aria-hidden="true">↗</span></Link>
            </>
          )}
        </section>
        <aside className="contact-aside">
          <div className="contact-number" aria-hidden="true">Hi.</div>
          <h2>Good things<br />to bring.</h2>
          <ul className="meet-list">
            <li>A link to the site, app or repo.</li>
            <li>What’s stuck, or what you want built.</li>
            <li>Any timing you’re working against.</li>
          </ul>
          <Link href="/contact">Rather write? Send a message ↗</Link>
          <Link href="/events">Rather meet in person? See events ↗</Link>
        </aside>
      </div>
    </CoastalPageShell>
  );
}
