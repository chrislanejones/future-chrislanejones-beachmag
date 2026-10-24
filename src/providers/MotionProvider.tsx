"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/** Every framer-motion animation on the site follows the visitor's reduced-motion setting. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
