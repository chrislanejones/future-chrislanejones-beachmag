import Image from "next/image";
import Link from "next/link";
import { EndNote } from "@/components/beachmag/interior-parts";
import { aboutSections } from "@/data/about-data";

function renderDescriptionWithLinks(description: string) {
  return description
    .replace(/[–—]/g, "-")
    .split(/(\[.*?\]\(.*?\))/g)
    .map((part, index) => {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      return match ? (
        <a key={index} href={match[2]} target="_blank" rel="noopener noreferrer">
          {match[1]}
        </a>
      ) : (
        <span key={index}>{part}</span>
      );
    });
}

// The design's chapters: a taped field-note photo beside each part of the story.
export default function AboutPage() {
  return (
    <>
      <div className="section-rule">
        <p>A FEW CHAPTERS OF MY LIFE</p>
        <p>FLORIDA / VIRGINIA / BACK AGAIN</p>
      </div>
      {aboutSections.map((section, index) => {
        const number = String(index + 1).padStart(2, "0");
        return (
          <section className="story-row" key={section.title}>
            <figure>
              <Image
                src={section.image}
                alt={section.imageAlt}
                width={520}
                height={400}
                sizes="(max-width: 640px) 85vw, 520px"
                loading={index === 0 ? "eager" : "lazy"}
              />
              <figcaption>FIELD NOTE / {number}</figcaption>
            </figure>
            <div>
              <p className="page-kicker">CHAPTER {number}</p>
              <h2>{section.title}</h2>
              {section.description.split("\n\n").map((paragraph, i) => (
                <p key={i}>{renderDescriptionWithLinks(paragraph)}</p>
              ))}
              {index === 0 && (
                <p>
                  <Link href="/career-and-resume">Career &amp; Resume</Link>
                </p>
              )}
            </div>
          </section>
        );
      })}
      <EndNote line="Good people. Good conversations." href="/conferences" label="Conferences & community" />
    </>
  );
}
