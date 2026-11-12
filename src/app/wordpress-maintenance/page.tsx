import { CoastalPageShell } from "@/components/coastal/page-shell";
import styles from "@/components/coastal/interior.module.css";
import { CoastalPageIntro } from "@/components/coastal/page-intro";
import WPMaintenanceContent from "./WP-MaintenanceContent";
import { getPageSEO } from "@/lib/seo";

export const revalidate = 86400; // once a day; admin saves refresh it at once (api/revalidate)

export async function generateMetadata() {
  return await getPageSEO("/wordpress-maintenance");
}

export default function WordPressMaintenancePage() {
  return (
    <CoastalPageShell>
      <CoastalPageIntro path="/wordpress-maintenance" />
      <div className={styles.content}>
        <WPMaintenanceContent />
      </div>
    </CoastalPageShell>
  );
}
