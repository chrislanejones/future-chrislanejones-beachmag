"use client";

import { useState, type ReactNode } from "react";
import { aiTools } from "@/data/ai-tools";
import { learning, stack } from "@/components/coastal/tech-stack";

type Tool = { name: string; svg: ReactNode };

const path = (d: string) => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d={d} /></svg>
);

// Same three lists as the beach site's tech section, in the design's binder.
const GROUPS: { name: string; tools: Tool[] }[] = [
  { name: "Tech I love", tools: stack.map(([name, icon]) => ({ name, svg: path(icon.path) })) },
  { name: "Learning & tinkering", tools: learning.map(([name, icon]) => ({ name, svg: path(icon.path) })) },
  { name: "Current AI tools", tools: aiTools.map((tool) => ({ name: tool.name, svg: tool.svg ?? path(tool.icon?.path ?? "") })) },
];

export function ToolGallery() {
  const [group, setGroup] = useState(0);
  const [moved, setMoved] = useState(false);
  return (
    <div className="viz-dotted-background">
      <div id="tool-gallery" role="group" aria-label="Technology gallery">
        <p className="eyebrow">THE TOOLS BEHIND THE WORK</p>
        <h2>A good set<br />of <em>tools.</em></h2>
        <div className="gallery-body">
          <nav className="category-rail" aria-label="Technology categories">
            {GROUPS.map((g, i) => (
              <button
                key={g.name}
                className="category cursor-interaction"
                type="button"
                aria-pressed={i === group}
                aria-controls={`tools-panel-${i}`}
                onClick={() => {
                  setGroup(i);
                  setMoved(true);
                }}
              >
                <span className="arrow" aria-hidden="true">↗</span>
                <span className="caption">{g.name}</span>
              </button>
            ))}
          </nav>
          <div className="panels">
            {GROUPS.map((g, i) => (
              <section
                key={g.name}
                className={`icon-panel${moved && i === group ? " arrive" : ""}`}
                id={`tools-panel-${i}`}
                aria-label={g.name}
                hidden={i !== group}
              >
                <div className="group-heading"><h3>{g.name}</h3><span>{g.tools.length} tools</span></div>
                <div className="icon-grid">
                  {g.tools.map((tool, n) => (
                    <div className="tech-item" key={tool.name} style={{ "--i": n } as React.CSSProperties}>
                      <span className="brand-icon" aria-hidden="true">{tool.svg}</span>
                      <span>{tool.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
        <div className="bottom">
          <span className="selection-status" aria-live="polite">{GROUPS[group].name} · {GROUPS[group].tools.length} tools</span>
          <em>Always building.</em>
        </div>
      </div>
    </div>
  );
}
