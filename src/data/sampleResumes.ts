import { ResumeData, TemplateId } from "../types/resume";

export const SAMPLE_RESUME_ZURICH: ResumeData = {
  id: "sample-zurich",
  title: "Claire Lindqvist — Staff Product Designer",
  updatedAt: new Date().toISOString(),
  template: "zurich",
  accent: "orange",
  density: "standard",
  personal: {
    fullName: "Claire Lindqvist",
    headline: "Staff Product Designer",
    email: "claire@lindqvist.studio",
    phone: "+41 44 580 29 14",
    location: "Zurich, Switzerland",
    website: "lindqvist.studio",
    linkedin: "linkedin.com/in/clairelindqvist",
  },
  summary:
    "Product designer with nine years of experience shaping financial workflows, design systems, and developer tooling across European fintech. Focused on reducing operational friction in high-density interfaces through clear typographic hierarchy and rigorous prototyping.",
  experience: [
    {
      id: "exp-1",
      role: "Staff Product Designer, Core Treasury",
      company: "Helvetia Pay",
      location: "Zurich",
      startDate: "Mar 2023",
      endDate: "Present",
      current: true,
      bullets: [
        "Led the redesign of multi-currency liquidity reconciliation used daily by 1,400+ enterprise finance teams, cutting average settlement review time by 38%.",
        "Architected a token-based design system in Figma and React across 42 product surfaces, eliminating 60% of duplicate UI components.",
        "Partnered with engineering leads to establish accessibility and keyboard-navigation standards across all ledger views.",
      ],
    },
    {
      id: "exp-2",
      role: "Senior Product Designer",
      company: "Nordic Ledger",
      location: "Stockholm",
      startDate: "Jun 2020",
      endDate: "Feb 2023",
      current: false,
      bullets: [
        "Designed the self-serve onboarding and KYB verification flow, lifting enterprise account activation from 54% to 79% within two quarters.",
        "Conducted 45+ contextual inquiry sessions with controllers and auditors to simplify automated tax-rule configuration.",
      ],
    },
    {
      id: "exp-3",
      role: "Product Designer",
      company: "Klara Systems",
      location: "Berlin",
      startDate: "Sep 2017",
      endDate: "May 2020",
      current: false,
      bullets: [
        "Owned end-to-end UX for the time-tracking and invoice approval mobile app, maintaining a 4.8 App Store rating across 12,000 reviews.",
        "Collaborated directly with frontend engineers on motion timing and responsive layout grids.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.A. in Visual Communication & Interaction",
      institution: "Zurich University of the Arts (ZHdK)",
      location: "Zurich",
      graduationDate: "2017",
      details: "Thesis on Swiss typographic grids in digital interfaces.",
    },
  ],
  skills: [
    {
      id: "sk-1",
      category: "Design & Systems",
      items: ["Product Architecture", "Design Systems", "Interaction Design", "Typography", "Figma"],
    },
    {
      id: "sk-2",
      category: "Technical & Research",
      items: ["HTML / CSS", "React / TypeScript", "Usability Testing", "WCAG AA Accessibility"],
    },
  ],
  projects: [
    {
      id: "pr-1",
      name: "Gridline Specimen",
      role: "Creator",
      year: "2024",
      link: "gridline.lindqvist.studio",
      description: "Open-source interactive reference for modular print-to-web CSS baseline grids.",
    },
  ],
};

export const SAMPLE_RESUME_EDITORIAL: ResumeData = {
  id: "sample-editorial",
  title: "Marcus Vance — Director of Product Strategy",
  updatedAt: new Date().toISOString(),
  template: "editorial",
  accent: "charcoal",
  density: "standard",
  personal: {
    fullName: "Marcus Vance",
    headline: "Director of Product Strategy",
    email: "marcus@vance-advisory.com",
    phone: "+1 (415) 890-3412",
    location: "San Francisco, CA",
    website: "vance-advisory.com",
    linkedin: "linkedin.com/in/marcusvance",
  },
  summary:
    "Product strategist and former founding PM guiding B2B software teams from early traction to disciplined category expansion. Experienced in pricing architecture, enterprise go-to-market alignment, and building high-ownership product organizations.",
  experience: [
    {
      id: "ed-exp-1",
      role: "Director of Product Strategy",
      company: "Cairn Analytics",
      location: "San Francisco",
      startDate: "Jan 2022",
      endDate: "Present",
      current: true,
      bullets: [
        "Restructured enterprise packaging into usage-based tiers, expanding net dollar retention from 108% to 126% across $48M ARR.",
        "Guided a 14-person product management group through two strategic acquisitions and unified platform roadmap planning.",
      ],
    },
    {
      id: "ed-exp-2",
      role: "Principal Product Manager",
      company: "Fieldwork Cloud",
      location: "New York",
      startDate: "Apr 2018",
      endDate: "Dec 2021",
      current: false,
      bullets: [
        "Launched the automated compliance reporting suite, capturing $9.2M in new annual contract value during its first 18 months.",
        "Established quarterly customer advisory councils across 30 Fortune 500 procurement leaders.",
      ],
    },
  ],
  education: [
    {
      id: "ed-edu-1",
      degree: "M.B.A., Technology & Operations",
      institution: "UC Berkeley Haas School of Business",
      location: "Berkeley, CA",
      graduationDate: "2018",
      details: "",
    },
  ],
  skills: [
    {
      id: "ed-sk-1",
      category: "Strategy",
      items: ["Pricing & Packaging", "Enterprise GTM", "M&A Integration", "Executive Alignment"],
    },
    {
      id: "ed-sk-2",
      category: "Execution",
      items: ["SQL & Cohort Analysis", "Product Discovery", "Roadmap Governance"],
    },
  ],
  projects: [
    {
      id: "ed-pr-1",
      name: "B2B Pricing Field Guide",
      role: "Author",
      year: "2024",
      link: "vance-advisory.com/guide",
      description: "Monograph examining hybrid seat-and-usage pricing models across 40 SaaS benchmarks.",
    },
  ],
};

export const SAMPLE_RESUME_MONOLITH: ResumeData = {
  id: "sample-monolith",
  title: "Devon Patel — Principal Systems Engineer",
  updatedAt: new Date().toISOString(),
  template: "monolith",
  accent: "cobalt",
  density: "compact",
  personal: {
    fullName: "Devon Patel",
    headline: "Principal Systems Engineer",
    email: "devon@patel.dev",
    phone: "+44 20 7946 0821",
    location: "London, UK",
    website: "patel.dev",
    linkedin: "github.com/devonpatel",
  },
  summary:
    "Distributed systems engineer specializing in low-latency event pipelines, storage engines, and reliable cloud infrastructure. Track record of scaling high-throughput services while maintaining strict observability and predictable tail latencies.",
  experience: [
    {
      id: "mo-exp-1",
      role: "Principal Systems Engineer",
      company: "Thames Telemetry",
      location: "London",
      startDate: "Feb 2022",
      endDate: "Present",
      current: true,
      bullets: [
        "Re-architected the core ingestion pipeline in Rust and Go to sustain 1.8M events/sec at p99 latency under 14ms.",
        "Reduced annual cloud compute and cross-AZ egress spend by $640K via partition-aware batching and Zstandard compression.",
        "Authored internal RFC standards and led incident post-mortems across 6 platform teams.",
      ],
    },
    {
      id: "mo-exp-2",
      role: "Senior Infrastructure Engineer",
      company: "Kestrel Compute",
      location: "London",
      startDate: "Jul 2018",
      endDate: "Jan 2022",
      current: false,
      bullets: [
        "Built zero-downtime PostgreSQL sharding automation supporting 40TB+ of time-series tenant workloads.",
        "Designed deterministic chaos testing harnesses integrated into CI for consensus failover validation.",
      ],
    },
  ],
  education: [
    {
      id: "mo-edu-1",
      degree: "M.Eng. in Computer Science",
      institution: "Imperial College London",
      location: "London",
      graduationDate: "2018",
      details: "First Class Honours",
    },
  ],
  skills: [
    {
      id: "mo-sk-1",
      category: "Languages",
      items: ["Rust", "Go", "TypeScript", "SQL", "C++"],
    },
    {
      id: "mo-sk-2",
      category: "Systems & Cloud",
      items: ["PostgreSQL", "Kafka", "Kubernetes", "Terraform", "OpenTelemetry"],
    },
  ],
  projects: [
    {
      id: "mo-pr-1",
      name: "Wal-Compact",
      role: "Maintainer",
      year: "2024",
      link: "github.com/devonpatel/wal-compact",
      description: "Lightweight write-ahead log compaction library in Rust with deterministic crash recovery tests.",
    },
  ],
};

export const SAMPLE_BY_TEMPLATE: Record<TemplateId, ResumeData> = {
  zurich: SAMPLE_RESUME_ZURICH,
  editorial: SAMPLE_RESUME_EDITORIAL,
  monolith: SAMPLE_RESUME_MONOLITH,
};

export function createBlankResume(template: TemplateId = "zurich"): ResumeData {
  return {
    id: `resume-${Date.now()}`,
    title: "Untitled Résumé",
    updatedAt: new Date().toISOString(),
    template,
    accent: template === "zurich" ? "orange" : "charcoal",
    density: "standard",
    personal: {
      fullName: "",
      headline: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
    },
    summary: "",
    experience: [
      {
        id: `exp-${Date.now()}`,
        role: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        bullets: [""],
      },
    ],
    education: [
      {
        id: `edu-${Date.now()}`,
        degree: "",
        institution: "",
        location: "",
        graduationDate: "",
        details: "",
      },
    ],
    skills: [
      {
        id: `sk-${Date.now()}`,
        category: "Core Skills",
        items: [],
      },
    ],
    projects: [],
  };
}
