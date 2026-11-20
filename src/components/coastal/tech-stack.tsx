import type { ReactNode } from "react";
import { aiTools } from "@/data/ai-tools";
import {
  siReact,
  siRust,
  siTypescript,
  siTailwindcss,
  siFramer,
  siNextdotjs,
  siReactquery,
  siThreedotjs,
  siDrizzle,
  siBun,
  siGnubash,
  siShadcnui,
  siConvex,
  siPosthog,
  siSentry,
  siStripe,
  siDocker,
  siDotnet,
  siTailscale,
  siRoku,
  siGo,
  siNixos,
  siSvelte,
  siKubernetes,
} from "simple-icons";
import { Reveal } from "./reveal";
import styles from "./coastal.module.css";

// simple-icons dropped C# (trademark), so this is a hand-drawn hexagon with
// "C#" inside, on the same 24x24 grid as the others.
const csharp = {
  path:
    "M12 .5 22 6.25v11.5L12 23.5 2 17.75V6.25Zm0 1.8L3.6 7.15v9.7L12 21.7l8.4-4.85v-9.7Z" +
    "M12.71 8.89A4.4 4.4 0 1 0 12.71 15.11L11.37 13.77A2.5 2.5 0 1 1 11.37 10.23Z" +
    "M14.9 9.3h1.1v5.4h-1.1ZM17.1 9.3h1.1v5.4h-1.1ZM13.8 10.3h5.5v1.1h-5.5ZM13.8 12.6h5.5v1.1h-5.5Z",
};

export const stack = [
  ["React", siReact],
  ["Rust", siRust],
  ["TypeScript", siTypescript],
  ["Tailwind", siTailwindcss],
  ["Framer Motion", siFramer],
  ["Next.js", siNextdotjs],
  ["TanStack", siReactquery],
  ["Three.js", siThreedotjs],
  ["Drizzle ORM", siDrizzle],
  ["Bun", siBun],
  ["Shell", siGnubash],
  ["ShadUI", siShadcnui],
  ["Convex", siConvex],
  ["PostHog", siPosthog],
  ["Sentry", siSentry],
  ["Stripe", siStripe],
  ["Docker", siDocker],
  ["C#", csharp],
  [".NET", siDotnet],
  ["Tailscale", siTailscale],
] as const;
export const learning = [
  ["Roku App Dev", siRoku],
  ["Go", siGo],
  ["NixOS", siNixos],
  ["Svelte", siSvelte],
  ["Kubernetes", siKubernetes],
] as const;
function Technology({
  name,
  path,
  svg,
}: {
  name: string;
  path?: string;
  svg?: ReactNode;
}) {
  return (
    <div className={styles.technology}>
      <span className={styles.technologyIcon} aria-hidden="true">
        {svg ?? (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d={path} />
          </svg>
        )}
      </span>
      <span>{name}</span>
    </div>
  );
}
export function CoastalTech() {
  return (
    <section
      className={`${styles.container} ${styles.techSection}`}
      aria-labelledby="tech-title"
    >
      <Reveal>
        <h2 id="tech-title">A good set of tools.</h2>
        <p className={styles.sectionDescription}>
          React, TypeScript, Rust/WebAssembly, AI automation, enterprise CMS,
          and WCAG accessibility.
        </p>
      </Reveal>
      <Reveal className={styles.techLayout}>
        <div className={styles.coreTools}>
          <h3>Tech I use</h3>
          <div className={styles.toolGrid}>
            {stack.map(([name, icon]) => (
              <Technology key={name} name={name} path={icon.path} />
            ))}
          </div>
        </div>
        <div className={styles.extraTools}>
          <div>
            <h3>Learning & tinkering</h3>
            <div className={styles.learningGrid}>
              {learning.map(([name, icon]) => (
                <Technology key={name} name={name} path={icon.path} />
              ))}
            </div>
          </div>
          <div>
            <h3>Current AI tools</h3>
            <div className={styles.aiGrid}>
              {aiTools.map((tool) => (
                <Technology
                  key={tool.name}
                  name={tool.name}
                  path={tool.icon?.path}
                  svg={tool.svg}
                />
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
