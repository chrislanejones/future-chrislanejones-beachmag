import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CoastalPageShell } from "@/components/coastal/page-shell";
import { BeachFigure } from "@/components/beachmag/beach-figure";
import { Button } from "@/components/ui/button";
import interior from "@/components/coastal/interior.module.css";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <CoastalPageShell>
      <section className={styles.wipeout} aria-labelledby="not-found-title">
        <div>
          <p className="page-kicker">404 / PAGE NOT FOUND</p>
          <h1 id="not-found-title" className={styles.title}>
            This one<br /><em>wiped out.</em>
          </h1>
          <p className={styles.intro}>
            Looks like this page didn’t make it back to shore.
            Head home, or explore the site to find your next stop.
          </p>
          <div className={interior.actions}>
            <Button asChild variant="radio" className={styles.homeButton}>
              <Link href="/">
                Back home <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
            <Link className={interior.textLink} href="/site-map">
              Explore the site <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <BeachFigure name="broken-surfboard" className={styles.board} />
      </section>
    </CoastalPageShell>
  );
}
