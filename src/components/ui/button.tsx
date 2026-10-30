"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

// The one button style source. Every look reads the globals.css tokens:
// admin/interior controls use --color-*, coastal pages use --coast-*.
const boxy = "rounded-lg hover:shadow-glow";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "transition focus-ring",
    "select-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:shadow-none",
    "disabled:opacity-40 disabled:saturate-50",
  ].join(" "),
  {
    variants: {
      variant: {
        // Filled teal, the Contact button color.
        primary: cn(
          boxy,
          "bg-(--color-accent) shadow-glow text-(--color-on-accent)",
          "border border-transparent hover:bg-(--color-accent)/90",
        ),
        // Outlined, the default admin action.
        secondary: cn(
          boxy,
          "bg-transparent text-foreground border border-(--color-border)",
        ),
        ghost: cn(
          boxy,
          "bg-transparent text-foreground hover:bg-(--color-surface-hover)",
        ),
        // Soft filled surface, used for round icon buttons outside the coast.
        neutral: cn(
          boxy,
          "bg-(--color-surface-hover) shadow-glow text-foreground",
          "hover:border-(--color-border)",
        ),
        // Filled danger for deletes; no teal glow on a red control.
        destructive: [
          "rounded-lg border border-transparent",
          "bg-(--color-danger) text-(--color-panel) hover:bg-(--color-danger)/85",
        ].join(" "),
        // A silver key off the home page radio's transport row: brushed
        // metal, a thick bottom edge, and it presses down when clicked. The
        // one public-page button (2026-10-30: no more teal pills).
        radio: [
          "rounded-[3px] border border-(--bm-silver-rim) border-b-[5px] border-b-(--bm-silver-edge)",
          "bg-[linear-gradient(100deg,var(--bm-silver-hi),var(--bm-silver-lo))] text-(--bm-ink)",
          "shadow-[0_2px_2px_rgb(0_0_0/0.4)] font-bold uppercase tracking-[0.1em] whitespace-nowrap no-underline",
          "transition-[translate,border-width] duration-100",
          "hover:bg-none hover:bg-(--bm-silver-warm)",
          "active:translate-y-[3px] active:border-b-2 active:bg-none active:bg-(--bm-silver-press)",
          "aria-pressed:translate-y-[3px] aria-pressed:border-b-2 aria-pressed:bg-none aria-pressed:bg-(--bm-silver-press)",
          "motion-reduce:active:translate-none",
        ].join(" "),
        // Coastal outlined circle (carousel arrows, new quote, next track).
        circle: [
          "shrink-0 rounded-(--radius-pill) border border-(--coast-line)",
          "transition-[background-color,scale] duration-180",
          "hover:bg-(--coast-soft) active:scale-[0.94]",
        ].join(" "),
      },
      size: {
        sm: "h-9 px-4 py-2 text-sm",
        md: "h-10 px-4 py-2 text-sm",
        lg: "h-11 px-5 py-3 text-base",
        icon: "size-10 p-0",
        "icon-sm": "size-8 p-0",
      },
      round: { true: "rounded-full", false: "" },
    },
    // Compound rules come after size, so the coastal shapes own their geometry.
    compoundVariants: [
      {
        variant: "radio",
        className: [
          "h-auto min-h-12 gap-3 px-[22px] py-3 text-xs",
          "[&_svg]:size-[17px] [&_svg]:shrink-0",
        ].join(" "),
      },
      { variant: "circle", className: "p-0" },
      { variant: "circle", size: "sm", className: "size-9" },
      { variant: "circle", size: ["md", "icon"], className: "size-10" },
      { variant: "circle", size: "lg", className: "size-11" },
    ],
    defaultVariants: {
      variant: "neutral",
      size: "md",
      round: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  showExternalIcon?: boolean;
}

export function Button({
  className,
  variant,
  size,
  round,
  asChild,
  showExternalIcon = false,
  type,
  children,
  ...props
}: ButtonProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  const Comp = asChild ? Slot : "button";

  // Add external link icon on focus if enabled
  const enhancedChildren = React.useMemo(() => {
    if (!showExternalIcon) return children;

    if (
      React.isValidElement<{
        children?: React.ReactNode;
        onFocus?: (e: React.FocusEvent<HTMLElement>) => void;
        onBlur?: (e: React.FocusEvent<HTMLElement>) => void;
      }>(children)
    ) {
      const originalChildren = children.props.children;

      return React.cloneElement(children, {
        ...children.props,
        onFocus: (e: React.FocusEvent<HTMLElement>) => {
          setIsFocused(true);
          if (children.props.onFocus) {
            children.props.onFocus(e);
          }
        },
        onBlur: (e: React.FocusEvent<HTMLElement>) => {
          setIsFocused(false);
          if (children.props.onBlur) {
            children.props.onBlur(e);
          }
        },
        children: (
          <>
            {originalChildren}
            {isFocused && (
              <ExternalLink
                className="w-4 h-4 ml-1 transition-opacity duration-200"
                aria-hidden="true"
              />
            )}
          </>
        ),
      });
    }

    // Fallback for text-only children
    return (
      <>
        {children}
        {isFocused && (
          <ExternalLink
            className="w-4 h-4 ml-1 transition-opacity duration-200"
            aria-hidden="true"
          />
        )}
      </>
    );
  }, [children, showExternalIcon, isFocused]);

  const buttonProps = {
    ...props,
    // Never submit a form by accident; forms opt in with type="submit".
    // Slot children (links) keep their own semantics.
    ...(asChild ? {} : { type: type ?? "button" }),
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      if (!showExternalIcon) setIsFocused(true);
      props.onFocus?.(e as React.FocusEvent<HTMLButtonElement>);
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      if (!showExternalIcon) setIsFocused(false);
      props.onBlur?.(e as React.FocusEvent<HTMLButtonElement>);
    },
  };

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, round }), className)}
      {...buttonProps}
    >
      {enhancedChildren}
    </Comp>
  );
}
