"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Waves } from "lucide-react";
import { setTheme, useTheme } from "@/lib/theme-store";

const DESKTOP_LINKS = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/browser-tabs", label: "Browser Tabs" },
  { href: "/#beach-offline", label: "Journal" },
  { href: "/#sandbox", label: "Sandbox" },
];

const MENU_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/#beach-offline", label: "Journal" },
  { href: "/#sandbox", label: "Sandbox" },
  { href: "/browser-tabs", label: "Browser Tabs" },
  { href: "/contact", label: "Contact" },
];

// The life-preserver menu. It takes over the screen on phones; body classes
// drive the slide in and out, so the closing animation can finish first.
export function SiteNav() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    const body = document.body;
    const content = document.getElementById("page-content");
    body.classList.toggle("menu-open", open);
    if (content) content.inert = open;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    toggleRef.current?.focus({ preventScroll: true });
    if (open) {
      body.classList.remove("menu-closing");
      return;
    }
    body.classList.add("menu-closing");
    const timer = setTimeout(() => body.classList.remove("menu-closing"), 720);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
      if (event.key !== "Tab" || !menuRef.current || !toggleRef.current) return;
      const nodes = [toggleRef.current, ...menuRef.current.querySelectorAll<HTMLElement>("a,button")];
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const wide = matchMedia("(min-width:641px)");
    const onWide = (event: MediaQueryListEvent) => event.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  useEffect(() => () => document.body.classList.remove("menu-open", "menu-closing"), []);

  return (
    <>
      <header id="site-nav">
        <Link className="nav-brand" href="/" aria-label="Chris Lane Jones — home" inert={open}>
          {/* The waves mark from the beach site's header. */}
          <span className="brand-marks" aria-hidden="true">
            <Waves className="brand-wave" size={38} strokeWidth={1.5} />
          </span>
          <span className="brand-wordmark">CHRIS LANE JONES <span>THE COASTAL EDITION</span></span>
        </Link>
        <nav className="desktop-links" aria-label="Main navigation" inert={open}>
          {DESKTOP_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
          <Link href="/contact">Contact ↗</Link>
        </nav>
        <button
          ref={toggleRef}
          className="life-toggle"
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-takeover"
          onClick={() => setOpen((value) => !value)}
        >
          <span></span><span></span>
        </button>
      </header>
      <div
        ref={menuRef}
        id="site-takeover"
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        aria-hidden={!open}
        inert={!open}
      >
        <p className="menu-label">CHRIS LANE JONES / MENU</p>
        <nav aria-label="Mobile navigation">
          {MENU_LINKS.map((link, order) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ "--order": String(order) } as React.CSSProperties}
              onClick={() => setOpen(false)}
            >
              {link.label} <span>↗</span>
            </Link>
          ))}
        </nav>
        <div className="menu-bottom">
          <p>CHOOSE YOUR EDITION</p>
          <div className="menu-editions" role="group" aria-label="Color scheme">
            <button type="button" aria-pressed={theme === "light"} onClick={() => setTheme("light")}>Sunlit paper ☀</button>
            <button type="button" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>After dark ☾</button>
          </div>
          <em>See you out there.</em>
        </div>
      </div>
    </>
  );
}
