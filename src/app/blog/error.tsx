"use client";
import { CoastalPageShell } from "@/components/coastal/page-shell";
import coastal from "@/components/coastal/coastal.module.css";
import { Button } from "@/components/ui/button";

export default function BlogError({ reset }: { reset: () => void }) {
  return <CoastalPageShell><header className={coastal.pageIntro}>
    <h1>Couldn’t load the blog.</h1>
    <p>The articles are temporarily unavailable. Please try again.</p>
    <Button variant="pill" size="lg" onClick={reset}>Try again</Button>
  </header></CoastalPageShell>;
}
