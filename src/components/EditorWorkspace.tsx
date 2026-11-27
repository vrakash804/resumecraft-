import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Download,
  FileText,
  Plus,
  Printer,
  RotateCcw,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import { createBlankResume, SAMPLE_BY_TEMPLATE } from "../data/sampleResumes";
import {
  ACCENT_PALETTE,
  AccentTone,
  DensityMode,
  EditorSectionId,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  ResumeData,
  SkillGroup,
  TEMPLATES_META,
  TemplateId,
} from "../types/resume";
import { AtsPanel } from "./AtsPanel";
import { ResumePreview } from "./ResumePreview";

interface EditorWorkspaceProps {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
  onSave: () => void;
  onBackToLanding: () => void;
  initialSection?: EditorSectionId;
}

const SECTIONS: { id: EditorSectionId; label: string }[] = [
  { id: "personal", label: "Personal Details" },
  { id: "summary", label: "Summary" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "ats", label: "ATS Alignment" },
];

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
  resume,
  onChange,
  onSave,
  onBackToLanding,
  initialSection = "personal",
}) => {
  const [activeSection, setActiveSection] =
    useState<EditorSectionId>(initialSection);
  const [mobilePane, setMobilePane] = useState<"edit" | "preview">("edit");
  const [zoom, setZoom] = useState<"fit" | "75" | "100">("fit");
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // AI assistance states
  const [aiBusyKey, setAiBusyKey] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [summaryUndo, setSummaryUndo] = useState<string | null>(null);
  const [bulletsUndo, setBulletsUndo] = useState<Record<string, string[]>>({});

  // ATS Job Description persisted in component session
  const [jobDescription, setJobDescription] = useState("");
  const [newSkillDrafts, setNewSkillDrafts] = useState<Record<string, string>>(
    {}
  );

  // Measure preview container width for crisp "Fit" zoom
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fitScale, setFitScale] = useState(0.66);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    const updateScale = () => {
      if (!previewContainerRef.current) return;
      const availableWidth = previewContainerRef.current.clientWidth - 48;
      const computed = Math.min(0.85, Math.max(0.38, availableWidth / 794));
      setFitScale(Number(computed.toFixed(3)));
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [mobilePane]);

  const effectiveScale =
    zoom === "100" ? 1 : zoom === "75" ? 0.75 : fitScale;

  const triggerSave = () => {
    onSave();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1800);
  };

  const handleExportPdf = () => {
    onSave();
    window.print();
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(resume, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = (resume.personal.fullName || resume.title || "resume")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    a.href = url;
    a.download = `${safeName || "resume"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed && typeof parsed === "object" && parsed.personal) {
          onChange({
            ...createBlankResume(parsed.template || "zurich"),
            ...parsed,
            updatedAt: new Date().toISOString(),
          });
          setAiError(null);
        } else {
          setAiError("The selected JSON file does not match the résumé format.");
        }
      } catch {
        setAiError("Could not parse the selected JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Completion helpers (subtle, honest indicators)
  const isSectionComplete = (id: EditorSectionId): boolean => {
    switch (id) {
      case "personal":
        return Boolean(
          resume.personal.fullName.trim() && resume.personal.email.trim()
        );
      case "summary":
        return resume.summary.trim().length > 20;
      case "experience":
        return resume.experience.some(
          (e) => e.role.trim() && e.company.trim()
        );
      case "education":
        return resume.education.some(
          (e) => e.degree.trim() && e.institution.trim()
        );
      case "skills":
        return resume.skills.some((s) => s.items.length > 0);
      case "projects":
        return resume.projects.some((p) => p.name.trim());
      case "ats":
        return jobDescription.trim().length > 25;
    }
  };

  // AI helper calls
  const callRewrite = async (
    busyKey: string,
    mode:
      | "summary_draft"
      | "summary_tighten"
      | "bullets_improve"
      | "bullets_quantify"
      | "bullets_draft"
      | "tailor_summary",
    content: string,
    context: Record<string, unknown>,
    onResult: (text: string) => void
  ) => {
    setAiError(null);
    setAiBusyKey(busyKey);
    try {
      const response = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, content, context }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to complete writing request.");
      }
      if (typeof data.result === "string") {
        onResult(data.result);
      }
    } catch (err) {
      setAiError(
        err instanceof Error ? err.message : "AI writing assistance failed."
      );
    } finally {
      setAiBusyKey(null);
    }
  };

  const allSkillsFlat = resume.skills.flatMap((s) => s.items);

  const handleSummaryAi = (mode: "summary_draft" | "summary_tighten") => {
    const prev = resume.summary;
    callRewrite(
      mode,
      mode,
      resume.summary,
      {
        targetRole: resume.personal.headline,
        skills: allSkillsFlat,
      },
      (text) => {
        setSummaryUndo(prev);
        onChange({ ...resume, summary: text });
      }
    );
  };

  const handleTailorSummaryFromAts = async (jd: string) => {
    const prev = resume.summary;
    await callRewrite(
      "tailor_summary",
      "tailor_summary",
      resume.summary,
      {
        targetRole: resume.personal.headline,
        skills: allSkillsFlat,
        jobDescription: jd,
      },
      (text) => {
        setSummaryUndo(prev);
        onChange({ ...resume, summary: text });
      }
    );
  };

  const handleBulletsAi = (
    exp: ExperienceItem,
    mode: "bullets_improve" | "bullets_quantify" | "bullets_draft"
  ) => {
    const prev = [...exp.bullets];
    callRewrite(
      `${mode}-${exp.id}`,
      mode,
      exp.bullets.filter((b) => b.trim()).join("\n"),
      {
        roleTitle: exp.role,
        company: exp.company,
      },
      (text) => {
        const lines = text
          .split("\n")
          .map((l) => l.replace(/^[-•*]\s*/, "").trim())
          .filter(Boolean);
        if (lines.length > 0) {
          setBulletsUndo((u) => ({ ...u, [exp.id]: prev }));
          updateExperience(exp.id, { bullets: lines });
        }
      }
    );
  };

  // Mutators
  const updatePersonal = (patch: Partial<ResumeData["personal"]>) => {
    onChange({
      ...resume,
      personal: { ...resume.personal, ...patch },
    });
  };

  const updateExperience = (id: string, patch: Partial<ExperienceItem>) => {
    onChange({
      ...resume,
      experience: resume.experience.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    });
  };

  const addExperience = () => {
    const next: ExperienceItem = {
      id: `exp-${Date.now()}`,
      role: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      bullets: [""],
    };
    onChange({ ...resume, experience: [next, ...resume.experience] });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...resume,
      experience: resume.experience.filter((item) => item.id !== id),
    });
  };

  const moveExperience = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= resume.experience.length) return;
    const copy = [...resume.experience];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange({ ...resume, experience: copy });
  };

  const updateEducation = (id: string, patch: Partial<EducationItem>) => {
    onChange({
      ...resume,
      education: resume.education.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    });
  };

  const addEducation = () => {
    const next: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: "",
      institution: "",
      location: "",
      graduationDate: "",
      details: "",
    };
    onChange({ ...resume, education: [...resume.education, next] });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...resume,
      education: resume.education.filter((item) => item.id !== id),
    });
  };

  const updateSkillGroup = (id: string, patch: Partial<SkillGroup>) => {
    onChange({
      ...resume,
      skills: resume.skills.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    });
  };

  const addSkillGroup = () => {
    const next: SkillGroup = {
      id: `sk-${Date.now()}`,
      category: "Additional Skills",
      items: [],
    };
    onChange({ ...resume, skills: [...resume.skills, next] });
  };

  const removeSkillGroup = (id: string) => {
    onChange({
      ...resume,
      skills: resume.skills.filter((item) => item.id !== id),
    });
  };

  const addSkillToGroup = (groupId: string, rawSkill: string) => {
    const cleaned = rawSkill.trim();
    if (!cleaned) return;
    const target = resume.skills.find((s) => s.id === groupId);
    if (!target) return;
    if (target.items.some((i) => i.toLowerCase() === cleaned.toLowerCase())) {
      return;
    }
    updateSkillGroup(groupId, { items: [...target.items, cleaned] });
  };

  const addMissingKeywordToSkills = (kw: string) => {
    if (resume.skills.length === 0) {
      onChange({
        ...resume,
        skills: [
          { id: `sk-${Date.now()}`, category: "Core Skills", items: [kw] },
        ],
      });
      return;
    }
    const first = resume.skills[0];
    if (!first.items.some((i) => i.toLowerCase() === kw.toLowerCase())) {
      updateSkillGroup(first.id, { items: [...first.items, kw] });
    }
  };

  const updateProject = (id: string, patch: Partial<ProjectItem>) => {
    onChange({
      ...resume,
      projects: resume.projects.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    });
  };

  const addProject = () => {
    const next: ProjectItem = {
      id: `pr-${Date.now()}`,
      name: "",
      role: "",
      year: "",
      link: "",
      description: "",
    };
    onChange({ ...resume, projects: [...resume.projects, next] });
  };

  const removeProject = (id: string) => {
    onChange({
      ...resume,
      projects: resume.projects.filter((item) => item.id !== id),
    });
  };

  const inputClass =
    "w-full px-3 py-2 text-[14px] bg-white border border-[#DDDAD3] rounded-[6px] text-[#1C1C1C] placeholder:text-[#9A968E] focus:outline-none focus:border-[#E85D04] transition-colors duration-150";
  const labelClass = "block text-[12.5px] font-medium text-[#1C1C1C] mb-1.5";

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2] text-[#1C1C1C]">
      {/* Minimal Top Workspace Toolbar */}
      <header className="no-print sticky top-0 z-30 h-14 bg-white border-b border-[#DDDAD3] px-4 md:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#686868] hover:text-[#1C1C1C] transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Overview</span>
          </button>

          <span className="text-[#DDDAD3]" aria-hidden="true">
            /
          </span>

          <input
            type="text"
            aria-label="Résumé document title"
            value={resume.title}
            onChange={(e) => onChange({ ...resume, title: e.target.value })}
            className="font-display text-[14px] font-semibold text-[#1C1C1C] bg-transparent border border-transparent hover:border-[#DDDAD3] focus:border-[#E85D04] focus:bg-[#F8F7F2] rounded-[4px] px-2 py-1 min-w-0 w-[160px] sm:w-[240px] truncate focus:outline-none transition-colors duration-150"
          />

          <span className="hidden lg:inline text-[12px] text-[#686868] whitespace-nowrap">
            {savedNotice ? "Saved" : "Local draft"}
          </span>
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Template Selector */}
          <label className="sr-only" htmlFor="toolbar-template">
            Template
          </label>
          <select
            id="toolbar-template"
            value={resume.template}
            onChange={(e) =>
              onChange({ ...resume, template: e.target.value as TemplateId })
            }
            className="px-2.5 py-1.5 text-[13px] font-medium bg-[#F8F7F2] border border-[#DDDAD3] rounded-[6px] text-[#1C1C1C] focus:outline-none focus:border-[#E85D04]"
          >
            {TEMPLATES_META.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Accent Tone Selector (desktop) */}
          <div
            className="hidden md:flex items-center gap-1 px-2 py-1.5 bg-[#F8F7F2] border border-[#DDDAD3] rounded-[6px]"
            aria-label="Accent color"
          >
            {(Object.keys(ACCENT_PALETTE) as AccentTone[]).map((tone) => {
              const active = resume.accent === tone;
              return (
                <button
                  key={tone}
                  type="button"
                  title={ACCENT_PALETTE[tone].label}
                  aria-label={`Select ${ACCENT_PALETTE[tone].label} accent`}
                  aria-pressed={active}
                  onClick={() => onChange({ ...resume, accent: tone })}
                  className={`w-4 h-4 rounded-[3px] transition-transform duration-150 ${
                    active
                      ? "ring-1 ring-offset-2 ring-[#1C1C1C]"
                      : "opacity-75 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: ACCENT_PALETTE[tone].hex }}
                />
              );
            })}
          </div>

          {/* Density Selector (desktop) */}
          <label className="sr-only" htmlFor="toolbar-density">
            Spacing density
          </label>
          <select
            id="toolbar-density"
            value={resume.density}
            onChange={(e) =>
              onChange({ ...resume, density: e.target.value as DensityMode })
            }
            className="hidden sm:block px-2.5 py-1.5 text-[13px] font-medium bg-[#F8F7F2] border border-[#DDDAD3] rounded-[6px] text-[#1C1C1C] focus:outline-none focus:border-[#E85D04]"
          >
            <option value="compact">Compact</option>
            <option value="standard">Standard</option>
            <option value="relaxed">Relaxed</option>
          </select>

          <button
            type="button"
            onClick={triggerSave}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[#1C1C1C] bg-white border border-[#DDDAD3] hover:border-[#1C1C1C] rounded-[6px] transition-colors duration-150 whitespace-nowrap"
          >
            {savedNotice ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#E85D04]" />
                <span>Saved</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium text-white bg-[#E85D04] hover:bg-[#C94E00] rounded-[6px] transition-colors duration-150 whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </header>

      {/* Mobile Edit / Preview Switcher */}
      <div className="no-print lg:hidden bg-white border-b border-[#DDDAD3] px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-[#F8F7F2] border border-[#DDDAD3] rounded-[6px] p-0.5 w-full">
          <button
            type="button"
            onClick={() => setMobilePane("edit")}
            className={`flex-1 py-1.5 text-[13px] font-medium rounded-[4px] transition-colors duration-150 ${
              mobilePane === "edit"
                ? "bg-[#1C1C1C] text-white"
                : "text-[#686868]"
            }`}
          >
            Edit Content
          </button>
          <button
            type="button"
            onClick={() => setMobilePane("preview")}
            className={`flex-1 py-1.5 text-[13px] font-medium rounded-[4px] transition-colors duration-150 ${
              mobilePane === "preview"
                ? "bg-[#1C1C1C] text-white"
                : "text-[#686868]"
            }`}
          >
            A4 Preview
          </button>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="no-print flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left Navigation Sidebar */}
        <aside
          className={`${
            mobilePane === "edit" ? "flex" : "hidden lg:flex"
          } flex-col w-full lg:w-[224px] shrink-0 border-b lg:border-b-0 lg:border-r border-[#DDDAD3] bg-[#F8F7F2]`}
        >
          {/* Horizontal scroll on mobile, vertical stack on desktop */}
          <nav
            aria-label="Résumé sections"
            className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible px-3 py-2.5 lg:p-4 gap-1"
          >
            {SECTIONS.map((sec, idx) => {
              const active = activeSection === sec.id;
              const complete = isSectionComplete(sec.id);
              return (
                <React.Fragment key={sec.id}>
                  {sec.id === "ats" && (
                    <div className="hidden lg:block my-2 border-t border-[#DDDAD3]" />
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    className={`flex items-center justify-between gap-2 px-3 py-2 text-[13px] font-medium rounded-[5px] transition-colors duration-150 whitespace-nowrap shrink-0 text-left ${
                      active
                        ? "bg-white text-[#1C1C1C] border border-[#DDDAD3]"
                        : "text-[#686868] hover:text-[#1C1C1C] border border-transparent hover:bg-[#F0EDE6]/60"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`text-[11px] tabular-nums ${
                          active ? "text-[#E85D04]" : "text-[#9A968E]"
                        }`}
                      >
                        0{idx + 1}
                      </span>
                      <span>{sec.label}</span>
                    </span>
                    {complete && (
                      <Check
                        aria-label="Completed"
                        className="w-3.5 h-3.5 text-[#1C1C1C] shrink-0 hidden lg:block"
                      />
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </nav>

          {/* Sidebar Footer Utilities (Desktop) */}
          <div className="hidden lg:flex mt-auto p-4 border-t border-[#DDDAD3] flex-col gap-1.5 text-[12.5px]">
            <button
              type="button"
              onClick={() => onChange(SAMPLE_BY_TEMPLATE[resume.template])}
              className="flex items-center gap-2 px-2.5 py-1.5 text-[#686868] hover:text-[#1C1C1C] hover:bg-[#F0EDE6] rounded-[4px] transition-colors duration-150 text-left"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Load sample data</span>
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              className="flex items-center gap-2 px-2.5 py-1.5 text-[#686868] hover:text-[#1C1C1C] hover:bg-[#F0EDE6] rounded-[4px] transition-colors duration-150 text-left"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-2.5 py-1.5 text-[#686868] hover:text-[#1C1C1C] hover:bg-[#F0EDE6] rounded-[4px] transition-colors duration-150 text-left"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportJson}
              className="hidden"
            />

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 text-[#686868] hover:text-[#C94E00] hover:bg-[#F0EDE6] rounded-[4px] transition-colors duration-150 text-left"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear draft</span>
              </button>
            ) : (
              <div className="p-2 bg-white border border-[#DDDAD3] rounded-[5px] space-y-2">
                <p className="text-[12px] text-[#1C1C1C]">
                  Reset all fields to blank?
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onChange(createBlankResume(resume.template));
                      setConfirmReset(false);
                    }}
                    className="flex-1 py-1 text-[11.5px] font-medium text-white bg-[#C94E00] rounded-[4px]"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 py-1 text-[11.5px] font-medium text-[#1C1C1C] bg-[#F0EDE6] rounded-[4px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Center Editing Form Workspace */}
        <section
          className={`${
            mobilePane === "edit" ? "block" : "hidden lg:block"
          } w-full lg:w-[46%] xl:w-[540px] shrink-0 overflow-y-auto px-5 py-6 md:px-8 md:py-8 bg-[#F8F7F2]`}
        >
          {aiError && (
            <div
              role="alert"
              className="mb-5 p-3.5 bg-white border border-[#C94E00] rounded-[6px] flex items-start justify-between gap-3 text-[13px] text-[#1C1C1C]"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#C94E00] shrink-0 mt-0.5" />
                <span>{aiError}</span>
              </div>
              <button
                type="button"
                onClick={() => setAiError(null)}
                className="text-[12px] text-[#686868] hover:text-[#1C1C1C] shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* PERSONAL DETAILS */}
          {activeSection === "personal" && (
            <div className="space-y-5">
              <div className="border-b border-[#DDDAD3] pb-4">
                <h2 className="font-display text-[18px] font-semibold text-[#1C1C1C]">
                  Personal Details
                </h2>
                <p className="mt-1 text-[13px] text-[#686868]">
                  Contact header information displayed at the top of your
                  résumé.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="p-name" className={labelClass}>
                    Full name
                  </label>
                  <input
                    id="p-name"
                    type="text"
                    value={resume.personal.fullName}
                    onChange={(e) =>
                      updatePersonal({ fullName: e.target.value })
                    }
                    placeholder="Claire Lindqvist"
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="p-headline" className={labelClass}>
                    Target role or professional title
                  </label>
                  <input
                    id="p-headline"
                    type="text"
                    value={resume.personal.headline}
                    onChange={(e) =>
                      updatePersonal({ headline: e.target.value })
                    }
                    placeholder="Staff Product Designer"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="p-email" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="p-email"
                    type="email"
                    value={resume.personal.email}
                    onChange={(e) => updatePersonal({ email: e.target.value })}
                    placeholder="claire@studio.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="p-phone" className={labelClass}>
                    Phone
                  </label>
                  <input
                    id="p-phone"
                    type="tel"
                    value={resume.personal.phone}
                    onChange={(e) => updatePersonal({ phone: e.target.value })}
                    placeholder="+41 44 580 29 14"
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="p-location" className={labelClass}>
                    Location
                  </label>
                  <input
                    id="p-location"
                    type="text"
                    value={resume.personal.location}
                    onChange={(e) =>
                      updatePersonal({ location: e.target.value })
                    }
                    placeholder="Zurich, Switzerland"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="p-website" className={labelClass}>
                    Portfolio or website
                  </label>
                  <input
                    id="p-website"
                    type="text"
                    value={resume.personal.website}
                    onChange={(e) =>
                      updatePersonal({ website: e.target.value })
                    }
                    placeholder="lindqvist.studio"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="p-linkedin" className={labelClass}>
                    LinkedIn or GitHub
                  </label>
                  <input
                    id="p-linkedin"
                    type="text"
                    value={resume.personal.linkedin}
                    onChange={(e) =>
                      updatePersonal({ linkedin: e.target.value })
                    }
                    placeholder="linkedin.com/in/clairelindqvist"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SUMMARY */}
          {activeSection === "summary" && (
            <div className="space-y-5">
              <div className="border-b border-[#DDDAD3] pb-4">
                <h2 className="font-display text-[18px] font-semibold text-[#1C1C1C]">
                  Professional Summary
                </h2>
                <p className="mt-1 text-[13px] text-[#686868]">
                  Two or three concise sentences outlining your scope, domain,
                  and focus.
                </p>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label htmlFor="summary-text" className="text-[12.5px] font-medium text-[#1C1C1C]">
                    Summary prose
                  </label>

                  {/* Contextual AI Assistance beside field */}
                  <div className="flex items-center gap-1.5">
                    {summaryUndo !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          onChange({ ...resume, summary: summaryUndo });
                          setSummaryUndo(null);
                        }}
                        className="px-2 py-1 text-[12px] font-medium text-[#686868] hover:text-[#1C1C1C] bg-white border border-[#DDDAD3] rounded-[4px] transition-colors duration-150"
                      >
                        Undo
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={aiBusyKey !== null}
                      onClick={() => handleSummaryAi("summary_draft")}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium text-[#1C1C1C] bg-white border border-[#DDDAD3] hover:border-[#E85D04] hover:text-[#E85D04] disabled:opacity-50 rounded-[4px] transition-colors duration-150"
                    >
                      <Wand2 className="w-3 h-3 text-[#E85D04]" />
                      <span>
                        {aiBusyKey === "summary_draft"
                          ? "Drafting..."
                          : "Draft summary"}
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={aiBusyKey !== null || !resume.summary.trim()}
                      onClick={() => handleSummaryAi("summary_tighten")}
                      className="px-2.5 py-1 text-[12px] font-medium text-[#1C1C1C] bg-white border border-[#DDDAD3] hover:border-[#1C1C1C] disabled:opacity-50 rounded-[4px] transition-colors duration-150"
                    >
                      {aiBusyKey === "summary_tighten"
                        ? "Tightening..."
                        : "Tighten prose"}
                    </button>
                  </div>
                </div>

                <textarea
                  id="summary-text"
                  rows={6}
                  value={resume.summary}
                  onChange={(e) =>
                    onChange({ ...resume, summary: e.target.value })
                  }
                  placeholder="Summarize your years of experience, core domain, and notable focus..."
                  className={`${inputClass} leading-[1.6] resize-y`}
                />
                <div className="mt-1.5 flex items-center justify-between text-[12px] text-[#686868] tabular-nums">
                  <span>Aim for 45–70 words for clean A4 pacing.</span>
                  <span>
                    {
                      resume.summary
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean).length
                    }{" "}
                    words
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* EXPERIENCE */}
          {activeSection === "experience" && (
            <div className="space-y-5">
              <div className="border-b border-[#DDDAD3] pb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-[18px] font-semibold text-[#1C1C1C]">
                    Work Experience
                  </h2>
                  <p className="mt-1 text-[13px] text-[#686868]">
                    List roles in reverse chronological order with measurable
                    outcomes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addExperience}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-white bg-[#1C1C1C] hover:bg-[#333333] rounded-[6px] transition-colors duration-150 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add role</span>
                </button>
              </div>

              {resume.experience.length === 0 ? (
                <div className="p-6 bg-white border border-[#DDDAD3] rounded-[6px] text-center">
                  <p className="text-[14px] text-[#686868]">
                    No work experience added yet.
                  </p>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="mt-3 px-4 py-2 text-[13px] font-medium text-white bg-[#E85D04] hover:bg-[#C94E00] rounded-[6px]"
                  >
                    Add first role
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {resume.experience.map((exp, idx) => (
                    <div
                      key={exp.id}
                      className="p-5 bg-white border border-[#DDDAD3] rounded-[6px] space-y-4"
                    >
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#F0EDE6]">
                        <span className="font-display text-[13px] font-semibold text-[#1C1C1C] tabular-nums">
                          Role 0{idx + 1}
                          {exp.company ? ` · ${exp.company}` : ""}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label="Move role up"
                            disabled={idx === 0}
                            onClick={() => moveExperience(idx, -1)}
                            className="p-1.5 text-[#686868] hover:text-[#1C1C1C] disabled:opacity-30 rounded-[4px]"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label="Move role down"
                            disabled={idx === resume.experience.length - 1}
                            onClick={() => moveExperience(idx, 1)}
                            className="p-1.5 text-[#686868] hover:text-[#1C1C1C] disabled:opacity-30 rounded-[4px]"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label="Remove role"
                            onClick={() => removeExperience(exp.id)}
                            className="p-1.5 text-[#686868] hover:text-[#C94E00] rounded-[4px]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Job title</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) =>
                              updateExperience(exp.id, { role: e.target.value })
                            }
                            placeholder="Senior Product Designer"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) =>
                              updateExperience(exp.id, {
                                company: e.target.value,
                              })
                            }
                            placeholder="Helvetia Pay"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Location</label>
                          <input
                            type="text"
                            value={exp.location}
                            onChange={(e) =>
                              updateExperience(exp.id, {
                                location: e.target.value,
                              })
                            }
                            placeholder="Zurich"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Start date</label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) =>
                              updateExperience(exp.id, {
                                startDate: e.target.value,
                              })
                            }
                            placeholder="Mar 2023"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>End date</label>
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              disabled={exp.current}
                              value={exp.current ? "Present" : exp.endDate}
                              onChange={(e) =>
                                updateExperience(exp.id, {
                                  endDate: e.target.value,
                                })
                              }
                              placeholder="Present"
                              className={`${inputClass} disabled:bg-[#F8F7F2] disabled:text-[#686868]`}
                            />
                            <label className="inline-flex items-center gap-2 text-[12px] text-[#686868] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={exp.current}
                                onChange={(e) =>
                                  updateExperience(exp.id, {
                                    current: e.target.checked,
                                  })
                                }
                                className="accent-[#E85D04]"
                              />
                              <span>Current role</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Bullets + Contextual AI Writing Assistance */}
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <label className="text-[12.5px] font-medium text-[#1C1C1C]">
                            Accomplishments (one per line)
                          </label>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {bulletsUndo[exp.id] && (
                              <button
                                type="button"
                                onClick={() => {
                                  updateExperience(exp.id, {
                                    bullets: bulletsUndo[exp.id],
                                  });
                                  setBulletsUndo((prev) => {
                                    const next = { ...prev };
                                    delete next[exp.id];
                                    return next;
                                  });
                                }}
                                className="px-2 py-1 text-[11.5px] font-medium text-[#686868] hover:text-[#1C1C1C] bg-[#F8F7F2] border border-[#DDDAD3] rounded-[4px]"
                              >
                                Undo
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={aiBusyKey !== null}
                              onClick={() =>
                                handleBulletsAi(exp, "bullets_draft")
                              }
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11.5px] font-medium text-[#1C1C1C] bg-[#F8F7F2] border border-[#DDDAD3] hover:border-[#E85D04] hover:text-[#E85D04] disabled:opacity-50 rounded-[4px] transition-colors duration-150"
                            >
                              <Wand2 className="w-3 h-3 text-[#E85D04]" />
                              <span>
                                {aiBusyKey === `bullets_draft-${exp.id}`
                                  ? "Drafting..."
                                  : "Draft"}
                              </span>
                            </button>
                            <button
                              type="button"
                              disabled={
                                aiBusyKey !== null ||
                                !exp.bullets.some((b) => b.trim())
                              }
                              onClick={() =>
                                handleBulletsAi(exp, "bullets_improve")
                              }
                              className="px-2 py-1 text-[11.5px] font-medium text-[#1C1C1C] bg-[#F8F7F2] border border-[#DDDAD3] hover:border-[#1C1C1C] disabled:opacity-50 rounded-[4px] transition-colors duration-150"
                            >
                              {aiBusyKey === `bullets_improve-${exp.id}`
                                ? "Refining..."
                                : "Refine"}
                            </button>
                            <button
                              type="button"
                              disabled={
                                aiBusyKey !== null ||
                                !exp.bullets.some((b) => b.trim())
                              }
                              onClick={() =>
                                handleBulletsAi(exp, "bullets_quantify")
                              }
                              className="px-2 py-1 text-[11.5px] font-medium text-[#1C1C1C] bg-[#F8F7F2] border border-[#DDDAD3] hover:border-[#1C1C1C] disabled:opacity-50 rounded-[4px] transition-colors duration-150"
                            >
                              {aiBusyKey === `bullets_quantify-${exp.id}`
                                ? "Sharpening..."
                                : "Quantify"}
                            </button>
                          </div>
                        </div>

                        <textarea
                          rows={5}
                          value={exp.bullets.join("\n")}
                          onChange={(e) =>
                            updateExperience(exp.id, {
                              bullets: e.target.value.split("\n"),
                            })
                          }
                          placeholder="Led the redesign of..."
                          className={`${inputClass} leading-[1.55] resize-y`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EDUCATION */}
          {activeSection === "education" && (
            <div className="space-y-5">
              <div className="border-b border-[#DDDAD3] pb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-[18px] font-semibold text-[#1C1C1C]">
                    Education
                  </h2>
                  <p className="mt-1 text-[13px] text-[#686868]">
                    Degrees, academic institutions, and relevant honors.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addEducation}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-white bg-[#1C1C1C] hover:bg-[#333333] rounded-[6px] shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add education</span>
                </button>
              </div>

              <div className="space-y-4">
                {resume.education.map((edu, idx) => (
                  <div
                    key={edu.id}
                    className="p-5 bg-white border border-[#DDDAD3] rounded-[6px] space-y-3.5"
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#F0EDE6]">
                      <span className="font-display text-[13px] font-semibold text-[#1C1C1C] tabular-nums">
                        Entry 0{idx + 1}
                      </span>
                      <button
                        type="button"
                        aria-label="Remove education entry"
                        onClick={() => removeEducation(edu.id)}
                        className="p-1 text-[#686868] hover:text-[#C94E00]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className={labelClass}>Degree or program</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) =>
                          updateEducation(edu.id, { degree: e.target.value })
                        }
                        placeholder="B.A. in Visual Communication"
                        className={inputClass}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className={labelClass}>Institution</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) =>
                            updateEducation(edu.id, {
                              institution: e.target.value,
                            })
                          }
                          placeholder="Zurich University of the Arts"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Location</label>
                        <input
                          type="text"
                          value={edu.location}
                          onChange={(e) =>
                            updateEducation(edu.id, {
                              location: e.target.value,
                            })
                          }
                          placeholder="Zurich"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Graduation year</label>
                        <input
                          type="text"
                          value={edu.graduationDate}
                          onChange={(e) =>
                            updateEducation(edu.id, {
                              graduationDate: e.target.value,
                            })
                          }
                          placeholder="2017"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Notes (optional)</label>
                        <input
                          type="text"
                          value={edu.details}
                          onChange={(e) =>
                            updateEducation(edu.id, { details: e.target.value })
                          }
                          placeholder="Honors or thesis focus"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SKILLS */}
          {activeSection === "skills" && (
            <div className="space-y-5">
              <div className="border-b border-[#DDDAD3] pb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-[18px] font-semibold text-[#1C1C1C]">
                    Skills & Capabilities
                  </h2>
                  <p className="mt-1 text-[13px] text-[#686868]">
                    Organize capabilities into clear, scannable groups.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSkillGroup}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-white bg-[#1C1C1C] hover:bg-[#333333] rounded-[6px] shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add group</span>
                </button>
              </div>

              <div className="space-y-4">
                {resume.skills.map((grp) => (
                  <div
                    key={grp.id}
                    className="p-5 bg-white border border-[#DDDAD3] rounded-[6px] space-y-3.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        aria-label="Skill group category"
                        value={grp.category}
                        onChange={(e) =>
                          updateSkillGroup(grp.id, {
                            category: e.target.value,
                          })
                        }
                        placeholder="Category name"
                        className="font-display text-[14px] font-semibold text-[#1C1C1C] bg-[#F8F7F2] border border-[#DDDAD3] rounded-[4px] px-2.5 py-1 flex-1 focus:outline-none focus:border-[#E85D04]"
                      />
                      <button
                        type="button"
                        aria-label="Remove skill group"
                        onClick={() => removeSkillGroup(grp.id)}
                        className="p-1.5 text-[#686868] hover:text-[#C94E00]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {grp.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12.5px] bg-[#F8F7F2] border border-[#DDDAD3] rounded-[4px] text-[#1C1C1C]"
                        >
                          <span>{item}</span>
                          <button
                            type="button"
                            aria-label={`Remove ${item}`}
                            onClick={() =>
                              updateSkillGroup(grp.id, {
                                items: grp.items.filter((_, i) => i !== idx),
                              })
                            }
                            className="text-[#686868] hover:text-[#C94E00] leading-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const val = newSkillDrafts[grp.id] || "";
                        val
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                          .forEach((s) => addSkillToGroup(grp.id, s));
                        setNewSkillDrafts((prev) => ({
                          ...prev,
                          [grp.id]: "",
                        }));
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={newSkillDrafts[grp.id] || ""}
                        onChange={(e) =>
                          setNewSkillDrafts((prev) => ({
                            ...prev,
                            [grp.id]: e.target.value,
                          }))
                        }
                        placeholder="Add skill or comma-separated list..."
                        className={inputClass}
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 text-[13px] font-medium text-[#1C1C1C] bg-[#F0EDE6] hover:bg-[#DDDAD3] rounded-[6px] transition-colors duration-150 shrink-0"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROJECTS */}
          {activeSection === "projects" && (
            <div className="space-y-5">
              <div className="border-b border-[#DDDAD3] pb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-[18px] font-semibold text-[#1C1C1C]">
                    Projects & Publications
                  </h2>
                  <p className="mt-1 text-[13px] text-[#686868]">
                    Optional selected work, open-source tools, or writing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addProject}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-white bg-[#1C1C1C] hover:bg-[#333333] rounded-[6px] shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add project</span>
                </button>
              </div>

              {resume.projects.length === 0 ? (
                <div className="p-6 bg-white border border-[#DDDAD3] rounded-[6px] text-center">
                  <p className="text-[14px] text-[#686868]">
                    No projects listed. This section stays hidden on your A4
                    sheet until you add an entry.
                  </p>
                  <button
                    type="button"
                    onClick={addProject}
                    className="mt-3 px-4 py-2 text-[13px] font-medium text-[#1C1C1C] bg-[#F0EDE6] hover:bg-[#DDDAD3] rounded-[6px]"
                  >
                    Add a project
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {resume.projects.map((proj, idx) => (
                    <div
                      key={proj.id}
                      className="p-5 bg-white border border-[#DDDAD3] rounded-[6px] space-y-3.5"
                    >
                      <div className="flex items-center justify-between pb-2.5 border-b border-[#F0EDE6]">
                        <span className="font-display text-[13px] font-semibold text-[#1C1C1C] tabular-nums">
                          Project 0{idx + 1}
                        </span>
                        <button
                          type="button"
                          aria-label="Remove project"
                          onClick={() => removeProject(proj.id)}
                          className="p-1 text-[#686868] hover:text-[#C94E00]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className={labelClass}>Project name</label>
                          <input
                            type="text"
                            value={proj.name}
                            onChange={(e) =>
                              updateProject(proj.id, { name: e.target.value })
                            }
                            placeholder="Gridline Specimen"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Role</label>
                          <input
                            type="text"
                            value={proj.role}
                            onChange={(e) =>
                              updateProject(proj.id, { role: e.target.value })
                            }
                            placeholder="Creator"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Year</label>
                          <input
                            type="text"
                            value={proj.year}
                            onChange={(e) =>
                              updateProject(proj.id, { year: e.target.value })
                            }
                            placeholder="2024"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Link</label>
                          <input
                            type="text"
                            value={proj.link}
                            onChange={(e) =>
                              updateProject(proj.id, { link: e.target.value })
                            }
                            placeholder="github.com/..."
                            className={inputClass}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className={labelClass}>Short description</label>
                          <textarea
                            rows={2}
                            value={proj.description}
                            onChange={(e) =>
                              updateProject(proj.id, {
                                description: e.target.value,
                              })
                            }
                            placeholder="One sentence describing outcome or scope."
                            className={`${inputClass} resize-y`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ATS ALIGNMENT */}
          {activeSection === "ats" && (
            <AtsPanel
              resume={resume}
              jobDescription={jobDescription}
              onJobDescriptionChange={setJobDescription}
              onAddMissingSkill={addMissingKeywordToSkills}
              onTailorSummary={handleTailorSummaryFromAts}
              tailoringSummary={aiBusyKey === "tailor_summary"}
            />
          )}
        </section>

        {/* Right Live A4 Preview Pane */}
        <section
          ref={previewContainerRef}
          className={`${
            mobilePane === "preview" ? "flex" : "hidden lg:flex"
          } flex-1 flex-col bg-[#F0EDE6] border-l border-[#DDDAD3] min-w-0`}
        >
          {/* Preview Bar */}
          <div className="h-11 px-5 border-b border-[#DDDAD3] bg-[#F0EDE6] flex items-center justify-between gap-4 shrink-0">
            <div className="text-[12px] text-[#686868] tabular-nums">
              A4 Preview · 210 × 297 mm
            </div>

            <div className="flex items-center gap-1 bg-[#F8F7F2] border border-[#DDDAD3] rounded-[5px] p-0.5">
              {(
                [
                  { id: "fit", label: "Fit" },
                  { id: "75", label: "75%" },
                  { id: "100", label: "100%" },
                ] as const
              ).map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => setZoom(z.id)}
                  className={`px-2 py-0.5 text-[11.5px] font-medium rounded-[3px] transition-colors duration-150 tabular-nums ${
                    zoom === z.id
                      ? "bg-[#1C1C1C] text-white"
                      : "text-[#686868] hover:text-[#1C1C1C]"
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Drafting Surface */}
          <div className="flex-1 overflow-auto p-6 flex justify-center items-start">
            <div
              className="relative bg-white border border-[#DDDAD3] shrink-0"
              style={{
                width: `${794 * effectiveScale}px`,
                minHeight: `${1123 * effectiveScale}px`,
              }}
            >
              <div
                className="origin-top-left"
                style={{
                  width: "794px",
                  minHeight: "1123px",
                  transform: `scale(${effectiveScale})`,
                }}
              >
                <ResumePreview data={resume} />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Dedicated Print-Only A4 Sheet for crisp vector PDF Export */}
      <div className="hidden print-only-container">
        <ResumePreview data={resume} isPrintTarget />
      </div>
    </div>
  );
};
