export type TemplateId = "zurich" | "editorial" | "monolith";

export type AccentTone = "charcoal" | "orange" | "cobalt" | "pine";

export type DensityMode = "compact" | "standard" | "relaxed";

export type EditorSectionId =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "ats";

export interface PersonalInfo {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  graduationDate: string;
  details: string;
}

export interface SkillGroup {
  id: string;
  category: string;
  items: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  year: string;
  link: string;
  description: string;
}

export interface ResumeData {
  id: string;
  title: string;
  updatedAt: string;
  template: TemplateId;
  accent: AccentTone;
  density: DensityMode;
  personal: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillGroup[];
  projects: ProjectItem[];
}

export interface AtsRecommendation {
  section: string;
  advice: string;
}

export interface AtsAnalysisResult {
  score: number;
  verdict: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendations: AtsRecommendation[];
}

export const ACCENT_PALETTE: Record<
  AccentTone,
  { label: string; hex: string; softBg: string }
> = {
  charcoal: { label: "Charcoal", hex: "#1C1C1C", softBg: "#F0EDE6" },
  orange: { label: "Signal Orange", hex: "#E85D04", softBg: "#FDF1EA" },
  cobalt: { label: "Swiss Cobalt", hex: "#1D4ED8", softBg: "#EFF6FF" },
  pine: { label: "Deep Pine", hex: "#155E52", softBg: "#ECFDF5" },
};

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  subtitle: string;
  description: string;
  structureLabel: string;
}

export const TEMPLATES_META: TemplateMeta[] = [
  {
    id: "zurich",
    name: "Zurich",
    subtitle: "Asymmetric Swiss Grid",
    description:
      "Two-column modular grid with crisp hairline rules, tabular dates, and a dedicated sidebar for skills and education.",
    structureLabel: "Two-column · 210 × 297 mm",
  },
  {
    id: "editorial",
    name: "Editorial",
    subtitle: "Typographic Classic",
    description:
      "Single-column reading rhythm combining Source Serif headings with Inter prose for leadership, research, and strategy roles.",
    structureLabel: "Single-column · 210 × 297 mm",
  },
  {
    id: "monolith",
    name: "Monolith",
    subtitle: "Compact Technical",
    description:
      "High-density architectural layout built for engineering and product specialists who need clean technical scannability.",
    structureLabel: "Structured compact · 210 × 297 mm",
  },
];
