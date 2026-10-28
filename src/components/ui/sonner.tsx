"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useTheme } from "@/lib/theme-store";
import { dmSans } from "@/components/beachmag/fonts";

// shadcn's Sonner, on the site's own theme store instead of next-themes.
// Toasts portal to <body>, outside the magazine shell, so they carry their
// font and palette with them (shell.css, .site-toaster).
export function Toaster(props: ToasterProps) {
  const theme = useTheme();
  return (
    <Sonner
      theme={theme}
      position="bottom-center"
      className={`site-toaster ${dmSans.variable}`}
      toastOptions={{ classNames: { toast: "site-toast" } }}
      {...props}
    />
  );
}
