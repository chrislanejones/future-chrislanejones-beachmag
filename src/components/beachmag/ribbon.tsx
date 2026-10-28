import type { ReactNode } from "react";

/**
 * The tilted orange ribbon: "Still making things." on the homepage hero
 * photo. `inline` sits it in the text flow instead of pinned to a photo's
 * corner, for longer lines such as a blog post's teaser (shell.css).
 */
export function Ribbon({ children, inline = false }: { children: ReactNode; inline?: boolean }) {
  return <span className={inline ? "sticker sticker-inline" : "sticker"}>{children}</span>;
}
