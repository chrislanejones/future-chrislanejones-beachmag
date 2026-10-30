"use client";

import Link from "next/link";
import { createElement, useEffect, useRef, useState } from "react";
import { Anchor, ChevronDown, Fish, Sailboat, Shell, Sun, Sunrise, TreePalm, Umbrella, Volleyball, Waves, type LucideIcon } from "lucide-react";
import { useHeaderNavItems } from "@/components/page/links";
import { setTheme, useTheme } from "@/lib/theme-store";

type NavItem = { label: string; href?: string; isExternal?: boolean; children?: NavItem[] };

const EVENTS: NavItem = { label: "Events", href: "/events" };

// The menu's subpage marks, in turn down the whole list.
const BEACH_MARKS = [Volleyball, Shell, TreePalm, Fish, Umbrella];
// Pages with a mark of their own, wherever they sit in the menu.
const PAGE_MARKS: Record<string, LucideIcon> = { "/lets-meet": Sunrise };

// The header's top-level links each keep their own mark, by address (or by
// label for the dropdowns, which have none), so reordering the menu in the
// admin doesn't shuffle them. Anything new gets the sun.
const HEADER_MARKS: Record<string, LucideIcon> = {
  "/": Waves,
  About: TreePalm,
  Work: Sailboat,
  "/blog": Shell,
  "/events": Umbrella,
  "/contact": Anchor,
  "/lets-meet": Sunrise,
};
const headerMark = (item: NavItem) => HEADER_MARKS[item.href ?? item.label] ?? HEADER_MARKS[item.label] ?? Sun;

/**
 * The live site's header nav (Convex, editable in the admin; static copy as
 * fallback), with Events added after Blog: it exists only on this site.
 */
function useNavItems(live: boolean): NavItem[] {
  const items = useHeaderNavItems(live) as NavItem[];
  if (items.some((item) => item.href === "/events" || item.children?.some((child) => child.href === "/events"))) return items;
  const blog = items.findIndex((item) => item.href === "/blog");
  const at = blog < 0 ? items.length - 1 : blog + 1;
  return [...items.slice(0, at), EVENTS, ...items.slice(at)];
}

function HeaderMark({ item }: { item: NavItem }) {
  return createElement(headerMark(item), { className: "nav-head-mark", size: 16, strokeWidth: 1.75, "aria-hidden": true });
}

/**
 * A dropdown on wide screens: opens on hover, click or keyboard; Escape and
 * outside clicks close it. Each page gets the same beach mark it has in the
 * life-preserver menu: `markStart` is how many subpages came before.
 */
function NavGroup({ item, markStart, open, onOpen, onClose }: { item: NavItem; markStart: number; open: boolean; onOpen: (hover: boolean) => void; onClose: (hover: boolean) => void }) {
  const id = `nav-group-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div
      className="nav-group"
      onPointerEnter={() => onOpen(true)}
      onPointerLeave={() => onClose(true)}
      // Tabbing out of the group closes its card.
      onBlur={(event) => open && !event.currentTarget.contains(event.relatedTarget) && onClose(false)}
    >
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => (open ? onClose(false) : onOpen(false))}>
        <HeaderMark item={item} />
        <span className="nav-group-label">{item.label}</span>
        <ChevronDown className="nav-caret" size={14} strokeWidth={2.5} aria-hidden="true" />
      </button>
      <div className="nav-dropdown" id={id} hidden={!open}>
        {item.children?.map((child, i) => {
          const Mark = PAGE_MARKS[child.href ?? ""] ?? BEACH_MARKS[(markStart + i) % BEACH_MARKS.length];
          return (
            <Link key={child.href} href={child.href ?? "/"} onClick={() => onClose(false)}>
              <Mark className="nav-mark" size={18} strokeWidth={1.75} aria-hidden="true" />
              {child.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// The life-preserver menu: every page on the site. It takes over the screen at
// any width; body classes drive the open and close, so the closing animation
// can finish first.
export function SiteNav({ offline = false }: { offline?: boolean }) {
  const theme = useTheme();
  // offline: the static list only (the shell renders this if the live nav throws).
  const items = useNavItems(!offline);
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<string | null>(null);
  const groupTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const desktopRef = useRef<HTMLElement>(null);
  // Hover only counts with a real pointer; a short delay lets it cross the gap to the menu.
  const openGroup = (label: string, hover: boolean) => {
    if (hover && !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    clearTimeout(groupTimer.current);
    setGroup(label);
  };
  const closeGroup = (hover: boolean) => {
    clearTimeout(groupTimer.current);
    if (hover) groupTimer.current = setTimeout(() => setGroup(null), 160);
    else setGroup(null);
  };
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // The last `open` the effect saw. Comparing values instead of counting runs
  // keeps a remount (Strict Mode runs effects twice) from moving focus on load.
  const lastOpen = useRef(open);

  useEffect(() => {
    const body = document.body;
    const content = document.getElementById("page-content");
    body.classList.toggle("menu-open", open);
    if (content) content.inert = open;
    if (lastOpen.current === open) return;
    lastOpen.current = open;
    // Let the browser apply visibility/inert changes before moving focus.
    // On the first production render, synchronous focus can otherwise be lost.
    const focusFrame = requestAnimationFrame(() => {
      (open ? closeRef : toggleRef).current?.focus({ preventScroll: true });
    });
    if (open) {
      body.classList.remove("menu-closing");
      return () => cancelAnimationFrame(focusFrame);
    }
    body.classList.add("menu-closing");
    const timer = setTimeout(() => body.classList.remove("menu-closing"), 720);
    return () => {
      cancelAnimationFrame(focusFrame);
      clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
      if (event.key !== "Tab" || !menuRef.current) return;
      const nodes = [...menuRef.current.querySelectorAll<HTMLElement>("a,button")];
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!menuRef.current.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
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

  useEffect(() => {
    if (!group) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Focus inside the card would vanish with it, so it goes back to the group's button.
      const card = document.activeElement?.closest("#site-nav .nav-dropdown");
      card?.closest(".nav-group")?.querySelector("button")?.focus();
      setGroup(null);
    };
    const onPointer = (event: PointerEvent) => {
      if (!desktopRef.current?.contains(event.target as Node)) setGroup(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [group]);

  useEffect(() => () => {
    document.body.classList.remove("menu-open", "menu-closing");
    const content = document.getElementById("page-content");
    if (content) content.inert = false;
    clearTimeout(groupTimer.current);
  }, []);

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
        <nav className="desktop-links" aria-label="Main navigation" inert={open} ref={desktopRef}>
          {items.map((item, index) =>
            item.children?.length ? (
              <NavGroup
                key={item.label}
                item={item}
                markStart={items.slice(0, index).reduce((count, earlier) => count + (earlier.children?.length ?? 0), 0)}
                open={group === item.label}
                onOpen={(hover) => openGroup(item.label, hover)}
                onClose={closeGroup}
              />
            ) : (
              <Link key={item.label} href={item.href ?? "/"}>
                <HeaderMark item={item} />
                <span className="nav-link-label">{item.href === "/contact" ? "Contact ↗" : item.label}</span>
              </Link>
            ),
          )}
        </nav>
        <button
          ref={toggleRef}
          className="life-toggle"
          inert={open}
          aria-hidden={open}
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
        {/* Desktop: the links are all in the header, so the preserver is the
            brand's ring here, not a menu. Phones keep the button above. */}
        <span className="life-toggle life-badge" aria-hidden="true" />
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
        <button ref={closeRef} type="button" className="menu-close" aria-label="Close menu" onClick={() => setOpen(false)}>
          <span aria-hidden="true">×</span>
        </button>
        <p className="menu-label">CHRIS LANE JONES / MENU</p>
        <nav aria-label="Site pages">
          {/* Groups show their name, then each subpage on its own line after a
              beach mark: volleyball, shell, palm, fish, umbrella, then again. */}
          {items
            .flatMap((item) => [item, ...(item.children ?? [])].map((entry) => ({ entry, sub: entry !== item, group: item })))
            .map((row, _i, rows) => ({ ...row, mark: rows.slice(0, _i).filter((earlier) => earlier.sub).length }))
            .map(({ entry, sub, group: parent, mark }, order) => {
            const Mark = PAGE_MARKS[entry.href ?? ""] ?? BEACH_MARKS[mark % BEACH_MARKS.length];
            const style = { "--order": String(order) } as React.CSSProperties;
            if (!sub && parent.children?.length) {
              return <p key={`group-${entry.label}`} className="menu-group" style={style}>{entry.label}</p>;
            }
            return (
              <Link
                key={`${parent.label}-${entry.href}`}
                href={entry.href ?? "/"}
                className={sub ? "menu-sub" : undefined}
                style={style}
                onClick={() => setOpen(false)}
              >
                {sub ? <Mark className="menu-mark" size={20} strokeWidth={1.75} aria-hidden="true" /> : null}
                {entry.label}
                {sub ? null : <span aria-hidden="true">↗</span>}
              </Link>
            );
          })}
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
