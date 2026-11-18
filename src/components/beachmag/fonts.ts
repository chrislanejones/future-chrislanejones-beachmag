import { Bodoni_Moda, DM_Sans, Limelight, Monoton } from "next/font/google";
import localFont from "next/font/local";

// The design's two faces, self-hosted through next/font. beachmag.css reads
// them from these variables instead of loading Google Fonts with @import.
export const bodoniModa = Bodoni_Moda({
  weight: "900",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-bodoni-moda",
});

export const dmSans = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

// The Vice edition's faces (vice.css). preload: false, so a browser fetches
// them only on the day the edition is on and a rule actually uses them.
export const monoton = Monoton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vice-neon",
  preload: false,
});

export const limelight = Limelight({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vice-deco",
  preload: false,
});

export const yellowtail = localFont({
  src: "../../../public/fonts/Yellowtail-Regular.woff2",
  variable: "--font-vice-script",
  preload: false,
});
