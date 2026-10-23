"use client";

import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import type { CastleTool } from "./sandcastle-model";
import { ToolArt } from "./tool-art";

// The tools fan across the top half of a dial, from 9 o'clock to 3 o'clock.
const SWEEP = 180;

export type KnobTool = { id: CastleTool; label: string; disabled: boolean; note?: ReactNode };

/**
 * The sand game's tool selector: the edition switch's chicken-head knob, larger,
 * with every tool on the dial around it. Click a tool to turn the knob to it;
 * click the knob or use the arrow keys to step through them.
 */
export function ToolKnob({ tools, value, onSelect, disabled }: {
  tools: KnobTool[];
  value: CastleTool;
  onSelect: (tool: CastleTool) => void;
  disabled: boolean;
}) {
  const index = Math.max(0, tools.findIndex((tool) => tool.id === value));
  const angleAt = (i: number) => -SWEEP / 2 + (SWEEP / (tools.length - 1)) * i;

  function step(by: number) {
    for (let n = 1; n <= tools.length; n++) {
      const next = tools[(index + by * n + tools.length * n) % tools.length];
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
        const radians = (angleAt(i) * Math.PI) / 180;
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
            <span>{tool.label}</span>
            {tool.note && <small>{tool.note}</small>}
          </button>
        );
      })}
      <div className="tool-knob-dial">
        {tools.map((tool, i) => (
          <i key={tool.id} className="tool-knob-tick" style={{ "--a": `${angleAt(i)}deg` } as CSSProperties} data-on={tool.id === value || undefined} />
        ))}
        <button
          type="button"
          className="tool-knob-turn"
          role="slider"
          aria-label="Tool"
          aria-valuemin={1}
          aria-valuemax={tools.length}
          aria-valuenow={index + 1}
          aria-valuetext={tools[index]?.label}
          disabled={disabled}
          onClick={() => step(1)}
          onKeyDown={onKey}
        >
          <span className="edition-knob" style={{ "--angle": `${angleAt(index)}deg` } as CSSProperties}>
            <span className="edition-bar"></span>
            <span className="edition-hub"></span>
            <span className="edition-pointer"></span>
          </span>
        </button>
      </div>
    </div>
  );
}
