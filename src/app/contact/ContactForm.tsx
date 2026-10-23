"use client";
import Link from "next/link";
import ContactForm from "@/components/page/contact-form";

const ELSEWHERE = [
  { href: "https://www.linkedin.com/in/chrislanejones", label: "LinkedIn" },
  { href: "https://github.com/chrislanejones", label: "GitHub" },
  { href: "https://x.com/cljwebdev", label: "X.com" },
  { href: "https://codeberg.org/chrislanejones", label: "Codeberg" },
  { href: "https://codepen.io/chrislanejones", label: "CodePen" },
];

// The design's letter, with the working form inside it, beside "Elsewhere".
export default function PageContactForm() {
  return (
    <>
      <div className="section-rule">
        <p>OPEN A CONVERSATION</p>
        <p>DESIGN / DEVELOPMENT / COLLABORATION</p>
      </div>
      <div className="contact-grid">
        <section className="contact-letter" aria-labelledby="contact-letter-title">
          <p className="page-kicker">TO: CHRIS LANE JONES</p>
          <h2 id="contact-letter-title">What are<br />you working on?</h2>
          <p>Tell me a little about your project, what you need help with, and any timing you have in mind.</p>
          <p>I consult, design, and develop web interfaces for businesses and government agencies.</p>
          <ContactForm variant="full" />
        </section>
        <aside className="contact-aside">
          <div className="contact-number" aria-hidden="true">Hello.</div>
          <h2>Elsewhere<br />on the internet.</h2>
          <p>Follow the work, explore the code, or connect.</p>
          {ELSEWHERE.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label} ↗<span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
        </aside>
      </div>
      <div className="contact-services">
        <Link href="/react-maintenance">
          <p className="page-kicker">01 / REACT SERVICES</p>
          <h3>Keep things moving. ↗</h3>
          <p>Explore my React maintenance services.</p>
        </Link>
        <Link href="/wordpress-maintenance">
          <p className="page-kicker">02 / WORDPRESS SERVICES</p>
          <h3>A little upkeep. ↗</h3>
          <p>Explore my WordPress maintenance services.</p>
        </Link>
      </div>
    </>
  );
}
