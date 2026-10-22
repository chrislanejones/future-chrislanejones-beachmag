import { Bodoni_Moda, DM_Sans } from "next/font/google";

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
