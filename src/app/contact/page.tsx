import { CoastalPageShell } from "@/components/coastal/page-shell";
import { PageHero } from "@/components/beachmag/interior-parts";
import ContactForm from "./ContactForm";
import { getPageSEO } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata() {
  return await getPageSEO("/contact");
}

export default function ContactPage() {
  return (
    <CoastalPageShell>
      <PageHero
        kicker="SAY HELLO"
        title={<>Send a<br /><em>little signal.</em></>}
        intro="A project to build, a website to untangle, or an idea worth talking about. Let’s start a conversation."
        path="/contact"
        caption="A message from your shore to mine. ↙"
      />
      <ContactForm />
    </CoastalPageShell>
  );
}
