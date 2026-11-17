import { CoastalPageShell } from "@/components/coastal/page-shell";
import { CoastalPageIntro } from "@/components/coastal/page-intro";
import DesignSystem from "./DesignSystem";
import { getPageSEO } from "@/lib/seo";

export const revalidate = 86400; // once a day; admin saves refresh it at once (api/revalidate)

export async function generateMetadata() {
  return await getPageSEO("/design-system");
}

export default function DesignSystemPage() {
  return (
    <CoastalPageShell>
      <CoastalPageIntro path="/design-system" />
      <DesignSystem />
    </CoastalPageShell>
  );
}
