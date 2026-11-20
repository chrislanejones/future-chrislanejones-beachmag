import type { Metadata } from "next";
import { CoastalPageShell } from "@/components/coastal/page-shell";
import { AudioLocker } from "./AudioLocker";

// Password-locked listening room. Nothing about it is in the HTML: the
// playlist and its file links only come back from Convex for the right
// password (convex/privateAudio.ts). Kept out of search and the sitemap.
export const metadata: Metadata = {
  title: "Audio",
  robots: { index: false, follow: false },
};

export default function AudioPage() {
  return (
    <CoastalPageShell>
      <AudioLocker />
    </CoastalPageShell>
  );
}
