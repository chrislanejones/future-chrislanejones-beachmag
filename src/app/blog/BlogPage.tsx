"use client";

import { useState } from "react";
import Link from "next/link";
import type { Doc } from "../../../convex/_generated/dataModel";

// Dates a person reads are MM-DD-YYYY; posts are stamped in UTC.
const readableDate = (time: number) => {
  const date = new Date(time);
  return [date.getUTCMonth() + 1, date.getUTCDate()].map((n) => String(n).padStart(2, "0")).join("-") + "-" + date.getUTCFullYear();
};

// "Off the deep end.": the journal, latest first, with a search. The list
// is server-rendered; the search only narrows it.
export default function BlogPage({ posts }: { posts: Doc<"blogPosts">[] }) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const filtered = posts.filter((post) =>
    [post.title, post.excerpt, ...(post.tags ?? [])].join(" ").toLowerCase().includes(query),
  );
  const years = posts.map((post) => new Date(post.createdAt).getUTCFullYear());
  const span = years.length ? `${Math.min(...years)}-${Math.max(...years)}` : "";
  return (
    <>
      <div className="section-rule">
        <p>THE JOURNAL / LATEST FIRST</p>
        <p>{span}</p>
      </div>
      <div className="journal-search">
        <label>
          FIND A STORY
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the journal…" aria-controls="journal-results" />
        </label>
        <p role="status" aria-live="polite">{filtered.length} of {posts.length} articles</p>
      </div>
      <div id="journal-results">
        {filtered.length ? (
          filtered.map((post) => (
            <article className="journal-entry" key={post._id}>
              <time dateTime={new Date(post.createdAt).toISOString()}>{readableDate(post.createdAt)}</time>
              <div>
                <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
                <p>{post.excerpt}</p>
                <Link className="read-link" href={`/blog/${post.slug}`}>
                  Read article<span className="sr-only">: {post.title}</span> <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          ))
        ) : (
          <div className="no-articles">
            <h2>{posts.length ? "No matching articles." : "No articles yet."}</h2>
            <p>{posts.length ? "Try another title or topic." : "New writing will appear here."}</p>
            {search && <button type="button" className="clear-search" onClick={() => setSearch("")}>Clear search</button>}
          </div>
        )}
      </div>
    </>
  );
}
