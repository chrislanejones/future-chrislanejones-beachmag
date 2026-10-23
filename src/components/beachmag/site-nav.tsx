"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Fish, Shell, TreePalm, Umbrella, Volleyball, Waves } from "lucide-react";
import { useHeaderNavItems } from "@/components/page/links";
import { setTheme, useTheme } from "@/lib/theme-store";

type NavItem = { label: string; href?: string; isExternal?: boolean; children?: NavItem[] };

const EVENTS: NavItem = { label: "Events", href: "/events" };

// The menu's subpage marks, in turn down the whole list.
const BEACH_MARKS = [Volleyball, Shell, TreePalm, Fish, Umbrella];

/**
 * The live site's header nav (Convex, editable in the admin; static copy as
 * fallback), with Events added after Blog: it exists only on this site.
 */
function useNavItems(): NavItem[] {
  const items = useHeaderNavItems() as NavItem[];
  if (items.some((item) => item.href === "/events" || item.children?.some((child) => child.href === "/events"))) return items;
  const blog = items.findIndex((item) => item.href === "/blog");
  const at = blog < 0 ? items.length - 1 : blog + 1;
  return [...items.slice(0, at), EVENTS, ...items.slice(at)];
}

/** A dropdown on wide screens: opens on hover, click or keyboard; Escape and outside clicks close it. */
function NavGroup({ item, open, onOpen, onClose }: { item: NavItem; open: boolean; onOpen: (hover: boolean) => void; onClose: (hover: boolean) => void }) {
  const id = `nav-group-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="nav-group" onPointerEnter={() => onOpen(true)} onPointerLeave={() => onClose(true)}>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => (open ? onClose(false) : onOpen(false))}>
        <span className="nav-group-label">{item.label}</span>
        <ChevronDown className="nav-caret" size={14} strokeWidth={2.5} aria-hidden="true" />
      </button>
      <div className="nav-dropdown" id={id} hidden={!open}>
        {item.children?.map((child) => (
          <Link key={child.href} href={child.href ?? "/"} onClick={() => onClose(false)}>{child.label}</Link>
        ))}
      </div>
    </div>
  );
}

// The life-preserver menu: every page on the site. It takes over the screen at
// any width; body classes drive the open and close, so the closing animation
// can finish first.
export function SiteNav() {
  const theme = useTheme();
  const items = useNavItems();
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

  useEffect(() => {
    if (!group) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setGroup(null);
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
          {items.filter((item) => item.href !== "/").map((item) =>
            item.children?.length ? (
              <NavGroup
                key={item.label}
                item={item}
                open={group === item.label}
                onOpen={(hover) => openGroup(item.label, hover)}
                onClose={closeGroup}
              />
            ) : (
              <Link key={item.label} href={item.href ?? "/"}>{item.href === "/contact" ? "Contact ↗" : item.label}</Link>
            ),
          )}
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
          {/* Groups show their name, then each subpage on its own line after a
              beach mark: volleyball, shell, palm, fish, umbrella, then again. */}
          {items
            .flatMap((item) => [item, ...(item.children ?? [])].map((entry) => ({ entry, sub: entry !== item, group: item })))
            .map((row, _i, rows) => ({ ...row, mark: rows.slice(0, _i).filter((earlier) => earlier.sub).length }))
            .map(({ entry, sub, group: parent, mark }, order) => {
            const Mark = BEACH_MARKS[mark % BEACH_MARKS.length];
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
