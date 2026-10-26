// src/data/career-timeline.ts
import type { CareerIconName } from "@/lib/career-icons";

export type TimelineEvent = {
  year: string;
  title: string;
  description: string;
  location?: string;
  iconName: CareerIconName;
};

export const timelineEvents: TimelineEvent[] = [
  {
    year: "2013",
    title: "I Am a First-Generation College Graduate",
    description:
      "Graduated from University of North Florida with Bachelor of Arts with a concentration in Multimedia Journalism & Production",
    location: "Jacksonville, FL",
    iconName: "GraduationCap",
  },
  {
    year: "2013-2016",
    title: "Lights, Camera, Action",
    description: "I Started a Career in Video Editing and Production",
    location: "Jacksonville, FL",
    iconName: "Video",
  },
  {
    year: "2016",
    title: "I Enjoyed Coding My Personal Website So Much I Switched Careers",
    description:
      "Decided to switch from video production to web design after designing personal website",
    location: "Jacksonville, FL",
    iconName: "Star",
  },
  {
    year: "2017",
    title: "Front-End Web Development (jQuery Days)",
    description:
      "Began working with WordPress Theme and Plugin Development, JavaScript, jQuery, and the MERN Stack",
    location: "Jacksonville, FL",
    iconName: "Lightbulb",
  },
  {
    year: "2018",
    title: "We Moved to the Mountains, Because Why Not?",
    description:
      "Relocated to Harrisonburg, Virginia in the Shenandoah Mountains",
    location: "Harrisonburg, VA",
    iconName: "Mountain",
  },
  {
    year: "2019",
    title: "Moved Once Again — Moving Companies Love Us",
    description:
      "Picked Living Among the Cows to Be Near the Mountains and Richmond, VA.",
    location: "Louisa, VA",
    iconName: "Home",
  },
  {
    year: "2023",
    title: "WordPress Meetup Host",
    description:
      "Started leading Richmond's local WordPress meetup with monthly sessions.",
    location: "Louisa, VA",
    iconName: "Users",
  },
  {
    year: "2024",
    title: "React Developer That Also Does WordPress",
    description:
      "98% React Developer these days - I still do WordPress from time to time",
    location: "Louisa, VA",
    iconName: "Code2",
  },
  {
    year: "2026",
    title: "Moved Back to Florida",
    description:
      "Left Central Virginia after eight years and moved back to Jacksonville, FL. Still remote, still building for the Commonwealth.",
    location: "Jacksonville, FL",
    iconName: "Home",
  },
];
