import Link from "next/link";
import type { ReactNode } from "react";

/** The underlined "All projects ↗" link a home section header ends with. Styles: beachmag.css. */
export function SeeAll({ href, children }: { href: string; children: ReactNode }) {
  return <Link className="see-all" href={href}>{children} <span aria-hidden="true">↗</span></Link>;
}
