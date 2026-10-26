import {
  Award, BookOpen, Briefcase, Code2, Coffee, GraduationCap, Home,
  Lightbulb, Mountain, Rocket, Star, Target, Users, Video,
  type LucideIcon,
} from "lucide-react";

// The public timeline and admin picker must interpret saved icon names identically.
export const CAREER_ICONS = {
  GraduationCap, Video, Star, Lightbulb, Mountain, Home, Users, Code2,
  Briefcase, Award, BookOpen, Coffee, Rocket, Target,
} satisfies Record<string, LucideIcon>;

export type CareerIconName = keyof typeof CAREER_ICONS;

export function getCareerIcon(name: string): LucideIcon {
  return Object.hasOwn(CAREER_ICONS, name)
    ? CAREER_ICONS[name as CareerIconName]
    : Briefcase;
}
