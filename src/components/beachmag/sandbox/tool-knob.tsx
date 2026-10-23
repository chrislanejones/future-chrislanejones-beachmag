"use client";

import { useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import type { CastleTool } from "./sandcastle-model";
import { ToolArt } from "./tool-art";

export type KnobTool = { id: CastleTool; label: string; short: string; disabled: boolean; note?: ReactNode };

/**
 * The sand game's tool selector, like the Sunlit / After dark switch: the
 * tools sit on the panel in a ring, upright and fixed, and the chicken-head
 * knob in the middle turns to point at the chosen one. Click a tool to turn
 * the knob to it; click the knob or use the arrow keys to step through them.
 * Styles: shell.css (.tool-knob).
 */
export function ToolKnob({ tools, value, onSelect, disabled }: {
  tools: KnobTool[];
  value: CastleTool;
  onSelect: (tool: CastleTool) => void;
  disabled: boolean;
}) {
  const count = tools.length;
  const slice = 360 / count;
  const index = Math.max(0, tools.findIndex((tool) => tool.id === value));
  // A running position so the knob always takes the short way round
  // (Remove → Tower is one click on, not seven back). Derived during render
  // when the tool changes, which React supports for state like this.
  const [dial, setDial] = useState({ index, position: index });
  if (dial.index !== index) {
    const step = ((index - dial.index + count + count / 2) % count) - count / 2;
    setDial({ index, position: dial.position + step });
  }

  function step(by: number) {
    for (let n = 1; n <= count; n++) {
      const next = tools[(((index + by * n) % count) + count) % count];
      if (!next.disabled) return onSelect(next.id);
    }
  }
  function onKey(event: KeyboardEvent) {
    const by = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[event.key];
    if (!by) return;
    event.preventDefault();
    step(by);
  }

  return (
    <div className="tool-knob">
      {tools.map((tool, i) => {
        const radians = (i * slice * Math.PI) / 180;
        const place = { "--x": Math.sin(radians).toFixed(3), "--y": Math.cos(radians).toFixed(3) } as CSSProperties;
        return (
          <button
            type="button"
            key={tool.id}
            className="tool-knob-label"
            style={place}
            aria-pressed={tool.id === value}
            disabled={disabled || tool.disabled}
            onClick={() => onSelect(tool.id)}
          >
            <ToolArt tool={tool.id} />
            <span>{tool.short}</span>
            {tool.note && <small>{tool.note}</small>}
          </button>
        );
      })}
      <div className="tool-knob-dial" aria-hidden="true"></div>
      <button
        type="button"
        className="tool-knob-turn"
        role="slider"
        aria-label="Tool"
        aria-valuemin={1}
        aria-valuemax={count}
        aria-valuenow={index + 1}
        aria-valuetext={tools[index]?.label}
        disabled={disabled}
        onClick={() => step(1)}
        onKeyDown={onKey}
      >
        <span className="tool-knob-grip" style={{ "--angle": `${dial.position * slice}deg` } as CSSProperties}>
          <span className="tool-knob-pointer"></span>
        </span>
      </button>
    </div>
  );
}
