import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SAMPLE_BY_TEMPLATE } from "../data/sampleResumes";
import { TEMPLATES_META, TemplateId } from "../types/resume";
import { Navbar } from "./Navbar";
import { ResumePreview } from "./ResumePreview";

interface LandingPageProps {
  onCreateNew: (template?: TemplateId) => void;
  onOpenSample: (template?: TemplateId) => void;
  onOpenAts: () => void;
}

const WORKFLOW_STEPS = [
  {
    num: "01",
    title: "Structure your record",
    detail:
      "Enter your experience, education, skills, and projects in a clean, distraction-free sidebar. Every edit updates the A4 sheet immediately.",
    note: "Autosaved locally in your browser",
  },
  {
    num: "02",
    title: "Refine language in context",
    detail:
      "Tighten a dense summary or sharpen role bullet points right beside the text field you are editing—never in a separate chat window.",
    note: "Powered by server-side Gemini writing assistance",
  },
  {
    num: "03",
    title: "Check ATS alignment",
    detail:
      "Paste a target job posting to surface missing keywords, role-specific gaps, and concrete section edits grounded in your actual experience.",
    note: "Structured keyword & clarity audit",
  },
  {
    num: "04",
    title: "Export clean A4 PDF",
    detail:
      "Print directly to a true vector PDF sized to 210 × 297 mm with crisp, selectable typography that hiring teams and parsers read reliably.",
    note: "Zero watermarks or account walls",
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onCreateNew,
  onOpenSample,
  onOpenAts,
}) => {
  const [heroTemplate, setHeroTemplate] = useState<TemplateId>("zurich");
  const heroFrameRef = useRef<HTMLDivElement>(null);
  const [heroScale, setHeroScale] = useState(0.66);

  useEffect(() => {
    const updateHeroScale = () => {
      if (!heroFrameRef.current) return;
      const width = heroFrameRef.current.clientWidth;
      const targetWidth = Math.min(540, width);
      setHeroScale(Number((targetWidth / 794).toFixed(4)));
    };
    updateHeroScale();
    const observer = new ResizeObserver(updateHeroScale);
    if (heroFrameRef.current) {
      observer.observe(heroFrameRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div id="top" className="min-h-screen bg-[#F8F7F2] text-[#1C1C1C]">
      <Navbar
        onCreateNew={() => onCreateNew("zurich")}
        onLoadSample={() => onOpenSample("zurich")}
        onNavigateSection={scrollToSection}
      />

      <main>
        {/* Two-column Editorial Hero */}
        <section className="max-w-[1320px] mx-auto px-6 md:px-10 pt-12 pb-16 md:pt-16 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-start">
            {/* Left Copy Column (5 cols) */}
            <div className="lg:col-span-5 lg:pt-8">
              <p className="text-[13px] font-medium text-[#686868] tracking-[0.01em] mb-4">
                Editorial résumé workspace
              </p>

              <h1 className="hero-title font-display font-bold text-[#1C1C1C]">
                Make your next move count.
              </h1>

              <p className="mt-5 text-[16px] leading-[1.65] text-[#686868] max-w-[46ch]">
                Write, structure, and typeset your résumé on a live A4 canvas.
                Pair Swiss typographic clarity with targeted writing
                assistance and direct job-description alignment.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onCreateNew(heroTemplate)}
                  className="inline-flex items-center gap-2 px-5 py-3 text-[15px] font-medium text-white bg-[#E85D04] hover:bg-[#C94E00] rounded-[6px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1C1C]"
                >
                  <span>Create résumé</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenSample(heroTemplate)}
                  className="inline-flex items-center gap-1.5 px-4 py-3 text-[15px] font-medium text-[#1C1C1C] bg-white border border-[#DDDAD3] hover:border-[#1C1C1C] rounded-[6px] transition-colors duration-150"
                >
                  <span>Edit sample</span>
                </button>
              </div>

              <div className="mt-10 pt-6 border-t border-[#DDDAD3] flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-[#686868]">
                <span>A4 vector PDF</span>
                <span aria-hidden="true">·</span>
                <span>Three editorial layouts</span>
                <span aria-hidden="true">·</span>
                <span>ATS keyword audit</span>
              </div>
            </div>

            {/* Right Live A4 Preview Column (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-[#F0EDE6] border border-[#DDDAD3] rounded-[8px] p-4 sm:p-6 md:p-8">
                {/* Preview frame top control strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#DDDAD3]">
                  <div className="text-[12px] font-medium text-[#686868]">
                    Live A4 specimen ·{" "}
                    <span className="text-[#1C1C1C]">
                      {
                        TEMPLATES_META.find((t) => t.id === heroTemplate)
                          ?.subtitle
                      }
                    </span>
                  </div>

                  <div
                    role="tablist"
                    aria-label="Preview template switcher"
                    className="inline-flex items-center bg-[#F8F7F2] border border-[#DDDAD3] rounded-[6px] p-0.5"
                  >
                    {TEMPLATES_META.map((tpl) => {
                      const active = heroTemplate === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setHeroTemplate(tpl.id)}
                          className={`px-2.5 py-1 text-[12px] font-medium rounded-[4px] transition-colors duration-150 whitespace-nowrap ${
                            active
                              ? "bg-[#1C1C1C] text-white"
                              : "text-[#686868] hover:text-[#1C1C1C]"
                          }`}
                        >
                          {tpl.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scaled live A4 document */}
                <div
                  ref={heroFrameRef}
                  className="w-full overflow-hidden flex justify-center"
                >
                  <div
                    className="relative bg-white border border-[#DDDAD3] overflow-hidden shrink-0"
                    style={{
                      width: `${794 * heroScale}px`,
                      height: `${1123 * heroScale}px`,
                    }}
                  >
                    <div
                      className="origin-top-left pointer-events-none select-none"
                      style={{
                        width: "794px",
                        height: "1123px",
                        transform: `scale(${heroScale})`,
                      }}
                    >
                      <ResumePreview data={SAMPLE_BY_TEMPLATE[heroTemplate]} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Editorial Template Showcase */}
        <section
          id="templates"
          className="border-t border-[#DDDAD3] bg-[#F8F7F2]"
        >
          <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-16 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
              <div className="lg:col-span-6">
                <p className="text-[13px] font-medium text-[#E85D04] mb-2">
                  Templates
                </p>
                <h2 className="section-title font-display font-bold text-[#1C1C1C]">
                  Three disciplined layouts built for reading.
                </h2>
              </div>
              <div className="lg:col-span-5 lg:col-start-8">
                <p className="text-[15px] leading-[1.6] text-[#686868]">
                  Every template follows strict baseline spacing, clear
                  typographic hierarchy, and clean single-page or multi-page A4
                  flow without decorative clutter.
                </p>
              </div>
            </div>

            {/* Asymmetric editorial template grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {TEMPLATES_META.map((tpl, idx) => {
                const sample = SAMPLE_BY_TEMPLATE[tpl.id];
                const colSpan =
                  idx === 0 ? "lg:col-span-5" : idx === 1 ? "lg:col-span-4" : "lg:col-span-3";

                return (
                  <div
                    key={tpl.id}
                    className={`${colSpan} flex flex-col bg-white border border-[#DDDAD3] rounded-[6px] overflow-hidden transition-colors duration-150 hover:border-[#1C1C1C]`}
                  >
                    {/* Live miniature A4 thumbnail */}
                    <div className="bg-[#F0EDE6] border-b border-[#DDDAD3] p-5 flex justify-center items-start overflow-hidden h-[290px]">
                      <div className="w-[220px] h-[311px] bg-white border border-[#DDDAD3] overflow-hidden shrink-0">
                        <div
                          className="origin-top-left pointer-events-none select-none"
                          style={{
                            width: "794px",
                            height: "1123px",
                            transform: "scale(0.277)",
                          }}
                        >
                          <ResumePreview data={sample} />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-display text-[18px] font-semibold text-[#1C1C1C]">
                            {tpl.name}
                          </h3>
                          <span className="text-[12px] text-[#686868]">
                            {tpl.subtitle}
                          </span>
                        </div>
                        <p className="mt-2.5 text-[14px] leading-[1.55] text-[#686868]">
                          {tpl.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#EAE7DF] flex items-center justify-between gap-3">
                        <span className="text-[12px] text-[#686868] tabular-nums">
                          {tpl.structureLabel}
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenSample(tpl.id)}
                          className="inline-flex items-center gap-1 text-[13px] font-medium text-[#1C1C1C] hover:text-[#E85D04] transition-colors duration-150 whitespace-nowrap"
                        >
                          <span>Use template</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Numbered Workflow with Horizontal Dividers */}
        <section
          id="workflow"
          className="border-t border-[#DDDAD3] bg-[#F8F7F2]"
        >
          <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-16 md:py-24">
            <div className="max-w-xl mb-12">
              <p className="text-[13px] font-medium text-[#E85D04] mb-2">
                Workflow
              </p>
              <h2 className="section-title font-display font-bold text-[#1C1C1C]">
                From rough notes to a finished A4 document.
              </h2>
            </div>

            <div className="border-t border-[#DDDAD3]">
              {WORKFLOW_STEPS.map((step) => (
                <div
                  key={step.num}
                  className="py-7 border-b border-[#DDDAD3] grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline"
                >
                  <div className="md:col-span-2 font-display text-[15px] font-semibold text-[#E85D04] tabular-nums">
                    {step.num}
                  </div>
                  <div className="md:col-span-4">
                    <h3 className="font-display text-[19px] font-semibold tracking-[-0.015em] text-[#1C1C1C]">
                      {step.title}
                    </h3>
                  </div>
                  <div className="md:col-span-6">
                    <p className="text-[15px] leading-[1.6] text-[#686868]">
                      {step.detail}
                    </p>
                    <p className="mt-2 text-[12px] text-[#686868]">
                      {step.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Focused ATS Alignment Overview */}
        <section
          id="ats-overview"
          className="border-t border-[#DDDAD3] bg-[#F0EDE6]/60"
        >
          <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-16 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6">
                <p className="text-[13px] font-medium text-[#E85D04] mb-2">
                  ATS alignment
                </p>
                <h2 className="section-title font-display font-bold text-[#1C1C1C]">
                  Compare your résumé against the role before you apply.
                </h2>
                <p className="mt-4 text-[15px] leading-[1.65] text-[#686868] max-w-[50ch]">
                  Paste a job description directly inside the editor to review
                  keyword coverage, identify understated skills, and tailor your
                  opening summary without fabricating experience.
                </p>
                <div className="mt-7 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={onOpenAts}
                    className="px-5 py-2.5 text-[14px] font-medium text-white bg-[#1C1C1C] hover:bg-[#333333] rounded-[6px] transition-colors duration-150"
                  >
                    Open ATS checker
                  </button>
                  <button
                    type="button"
                    onClick={() => onCreateNew("zurich")}
                    className="text-[14px] font-medium text-[#1C1C1C] hover:text-[#E85D04] transition-colors duration-150"
                  >
                    Start blank draft
                  </button>
                </div>
              </div>

              {/* Quiet structural preview of the ATS Audit table */}
              <div className="lg:col-span-5 lg:col-start-8 bg-white border border-[#DDDAD3] rounded-[6px] p-6">
                <div className="flex items-baseline justify-between pb-4 border-b border-[#EAE7DF]">
                  <div>
                    <div className="text-[12px] text-[#686868]">
                      Role alignment audit
                    </div>
                    <div className="mt-0.5 font-display text-[16px] font-semibold text-[#1C1C1C]">
                      Staff Product Designer
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-[26px] font-bold text-[#1C1C1C] tabular-nums leading-none">
                      84<span className="text-[14px] text-[#686868]">/100</span>
                    </div>
                  </div>
                </div>

                <div className="py-4 border-b border-[#EAE7DF] space-y-2">
                  <div className="text-[12px] font-medium text-[#1C1C1C]">
                    Matched terms
                  </div>
                  <p className="text-[13px] leading-[1.6] text-[#686868]">
                    Design Systems · Multi-currency Workflows · Figma Tokens ·
                    WCAG AA · Enterprise Onboarding
                  </p>
                </div>

                <div className="pt-4 space-y-2">
                  <div className="text-[12px] font-medium text-[#E85D04]">
                    Suggested additions
                  </div>
                  <p className="text-[13px] leading-[1.6] text-[#1C1C1C]">
                    Mention design-token governance across engineering squads in
                    your Helvetia Pay role summary.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Simple, functional footer */}
      <footer className="border-t border-[#DDDAD3] bg-[#F8F7F2]">
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="font-display text-[15px] font-bold text-[#1C1C1C]">
              ResumeCraft AI
            </div>
            <p className="mt-1 text-[13px] text-[#686868]">
              Focused résumé typesetting and ATS alignment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[13px] text-[#686868]">
            <a
              href="#templates"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("templates");
              }}
              className="hover:text-[#1C1C1C] transition-colors duration-150"
            >
              Templates
            </a>
            <a
              href="#workflow"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("workflow");
              }}
              className="hover:text-[#1C1C1C] transition-colors duration-150"
            >
              Workflow
            </a>
            <button
              type="button"
              onClick={() => onOpenSample("zurich")}
              className="hover:text-[#1C1C1C] transition-colors duration-150"
            >
              Open Sample
            </button>
            <button
              type="button"
              onClick={() => onCreateNew("zurich")}
              className="font-medium text-[#E85D04] hover:text-[#C94E00] transition-colors duration-150"
            >
              Create résumé
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
