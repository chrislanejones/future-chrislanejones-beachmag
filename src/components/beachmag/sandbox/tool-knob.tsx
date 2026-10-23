"use client";

import { useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import type { CastleTool } from "./sandcastle-model";
import { ToolArt } from "./tool-art";

export type KnobTool = { id: CastleTool; label: string; short: string; disabled: boolean; note?: ReactNode };

/**
 * The sand game's tool selector, built like an oven knob or an old UHF / VHF
 * channel dial: every tool is printed around the knob's face, and the whole
 * knob turns until the chosen one sits under the fixed pointer at the top.
 * Click a printed tool to turn to it; click the grip or use the arrow keys
 * to step. Styles: shell.css (.tool-knob).
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
  // The knob keeps a running position so it always takes the short way round
  // (Remove → Tower is one click on, not seven back). Derived during render
  // when the tool changes, which React supports for state like this.
  const [dial, setDial] = useState({ index, position: index });
  if (dial.index !== index) {
    const step = ((index - dial.index + count + count / 2) % count) - count / 2;
    setDial({ index, position: dial.position + step });
  }
  const current = tools[index];

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
      <p className="tool-knob-readout" aria-hidden="true">
        <span>{current?.label}</span>
        {current?.note && <small>{current.note}</small>}
      </p>
      <span className="tool-knob-index" aria-hidden="true"></span>
      <div className="tool-knob-body">
        <div className="tool-knob-face" style={{ "--turn": `${-dial.position * slice}deg` } as CSSProperties}>
          {tools.map((tool, i) => (
            <button
              type="button"
              key={tool.id}
              className="tool-knob-print"
              style={{ "--at": `${i * slice}deg` } as CSSProperties}
              aria-pressed={tool.id === value}
              aria-label={tool.label}
              disabled={disabled || tool.disabled}
              onClick={() => onSelect(tool.id)}
            >
              <ToolArt tool={tool.id} />
              <span>{tool.short}</span>
            </button>
          ))}
          <button
            type="button"
            className="tool-knob-grip"
            role="slider"
            aria-label="Tool"
            aria-valuemin={1}
            aria-valuemax={count}
            aria-valuenow={index + 1}
            aria-valuetext={current?.label}
            disabled={disabled}
            onClick={() => step(1)}
            onKeyDown={onKey}
          >
            <span className="tool-knob-pointer"></span>
          </button>
        </div>
      </div>
    </div>
  );
}
