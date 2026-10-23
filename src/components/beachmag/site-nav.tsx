"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Waves } from "lucide-react";
import { setTheme, useTheme } from "@/lib/theme-store";

const DESKTOP_LINKS = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/events", label: "Events" },
  { href: "/browser-tabs", label: "Browser Tabs" },
];

const MENU_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "Contact" },
];

// Every other page, small, under the big links.
const MORE_LINKS = [
  { href: "/career-and-resume", label: "Career & Resume" },
  { href: "/conferences", label: "Conferences" },
  { href: "/browser-tabs", label: "Browser Tabs" },
  { href: "/react-maintenance", label: "React Services" },
  { href: "/wordpress-maintenance", label: "WordPress Services" },
  { href: "/site-history", label: "Site History" },
  { href: "/link-page", label: "Link Page" },
  { href: "/site-map", label: "Site Map" },
];

// The life-preserver menu: every page on the site. It takes over the screen at
// any width; body classes drive the open and close, so the closing animation
// can finish first.
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
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
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
          <span className="brand-wordmark">CHRIS LANE JONES</span>
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
          onClick={() => {
            // The circle grows out of the life preserver, wherever the header put it.
            const box = toggleRef.current?.getBoundingClientRect();
            if (box && menuRef.current) {
              menuRef.current.style.setProperty("--menu-x", `${box.left + box.width / 2}px`);
              menuRef.current.style.setProperty("--menu-y", `${box.top + box.height / 2}px`);
            }
            setOpen((value) => !value);
          }}
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
        <nav aria-label="Site pages">
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
        <nav className="menu-more" aria-label="More pages">
          <p>MORE PAGES</p>
          <ul>
            {MORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>
              </li>
            ))}
          </ul>
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
