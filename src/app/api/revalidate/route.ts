import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isSiteOwner } from "@/lib/owner-policy";

// The admin calls this after every save so the public pages show the edit
// right away. Pages otherwise refresh once a day (`revalidate = 86400`), which
// keeps Vercel's ISR writes and CPU low: a 60-second window meant every crawler
// visit rebuilt the page it hit.
//
// Only the site owner can call it. A forged request from another site could at
// most refresh the cache, which is harmless, but the owner check keeps strangers
// from using it to make the site rebuild on demand.
export async function POST() {
  const { userId } = await auth();
  if (!userId || !isSiteOwner(userId)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  // Every page reads from Convex, and most edits touch more than one page
  // (a blog post shows on /blog, the homepage, the sitemap and llms.txt),
  // so refresh the whole site rather than guess which paths changed.
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
