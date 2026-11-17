"use client";

import { useState } from "react";
import { MOTION_LANES } from "@/data/design-system";

// One dot per real part. Play sends each dot across its lane in the time and
// on the curve that part uses. With Reduce Motion on, design-system.css turns
// the transition off and the dots jump, which is what the real parts do.
export function MotionDemo() {
  const [atEnd, setAtEnd] = useState(false);
  return (
    <div className="ds-demo">
      <div className="ds-demo__ctl">
        <button type="button" className="radio-key ds-play" onClick={() => setAtEnd((value) => !value)}>
          <span aria-hidden="true">{atEnd ? "◀" : "▶"}</span> {atEnd ? "Send them back" : "Play"}
        </button>
        <p className="ds-note">
          Each dot crosses in the time its part takes. With Reduce Motion on, nothing travels: the dots jump.
        </p>
      </div>
      <div className="ds-live">
        <ul className="ds-live__body ds-lanes">
          {MOTION_LANES.map((lane) => (
            <li key={lane.name} className="ds-lane">
              <span className="ds-lane__name">{lane.name}</span>
              <span className="ds-lane__track" aria-hidden="true">
                <span
                  className={atEnd ? "ds-lane__dot is-end" : "ds-lane__dot"}
                  style={{ transitionDuration: `${lane.ms}ms`, transitionTimingFunction: lane.easing }}
                />
              </span>
              <span className="ds-lane__ms">{lane.ms}ms</span>
            </li>
          ))}
        </ul>
        <p className="ds-live__cap">Six moves from around the site, slowest last</p>
      </div>
    </div>
  );
}
