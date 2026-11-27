import React, { useState } from "react";
import { AlertCircle, Check, Plus, RefreshCw } from "lucide-react";
import { AtsAnalysisResult, ResumeData } from "../types/resume";

interface AtsPanelProps {
  resume: ResumeData;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  onAddMissingSkill: (skill: string) => void;
  onTailorSummary: (jobDescription: string) => Promise<void>;
  tailoringSummary: boolean;
}

const SAMPLE_JOB_POSTING = `Staff Product Designer — Treasury & Core Platform
We are looking for a Staff Product Designer to lead complex financial workflows and multi-currency reconciliation experiences for enterprise finance teams.

Requirements:
- 7+ years designing high-density B2B SaaS or fintech products
- Deep experience architecting Figma design systems and React token libraries
- Track record improving enterprise onboarding and activation metrics
- Strong command of WCAG AA accessibility, keyboard navigation, and tabular data interfaces
- Experience partnering closely with engineering and product leadership on roadmap strategy`;

export const AtsPanel: React.FC<AtsPanelProps> = ({
  resume,
  jobDescription,
  onJobDescriptionChange,
  onAddMissingSkill,
  onTailorSummary,
  tailoringSummary,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AtsAnalysisResult | null>(null);
  const [addedSkills, setAddedSkills] = useState<Record<string, boolean>>({});

  const runAnalysis = async () => {
    setError(null);
    if (jobDescription.trim().length < 25) {
      setError("Paste a job description (at least 25 characters) to run an alignment check.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai/ats-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to analyze job alignment.");
      }
      setResult(data);
      setAddedSkills({});
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to complete ATS analysis."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (kw: string) => {
    onAddMissingSkill(kw);
    setAddedSkills((prev) => ({ ...prev, [kw]: true }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#DDDAD3] pb-4">
        <h2 className="font-display text-[18px] font-semibold text-[#1C1C1C]">
          ATS Alignment Check
        </h2>
        <p className="mt-1 text-[13px] leading-[1.55] text-[#686868]">
          Compare your current résumé against a specific job posting to inspect
          keyword coverage and structural gaps.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <label
            htmlFor="ats-jd-input"
            className="text-[13px] font-medium text-[#1C1C1C]"
          >
            Target job description
          </label>
          <button
            type="button"
            onClick={() => onJobDescriptionChange(SAMPLE_JOB_POSTING)}
            className="text-[12px] font-medium text-[#686868] hover:text-[#E85D04] transition-colors duration-150"
          >
            Insert sample posting
          </button>
        </div>
        <textarea
          id="ats-jd-input"
          rows={7}
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          placeholder="Paste the full job title, responsibilities, and requirements here..."
          className="w-full px-3.5 py-2.5 text-[13.5px] leading-[1.55] bg-white border border-[#DDDAD3] rounded-[6px] text-[#1C1C1C] placeholder:text-[#9A968E] focus:outline-none focus:border-[#E85D04] transition-colors duration-150 resize-y"
        />

        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={runAnalysis}
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-[#E85D04] hover:bg-[#C94E00] disabled:opacity-60 rounded-[6px] transition-colors duration-150"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing alignment...</span>
              </>
            ) : (
              <span>Analyze alignment</span>
            )}
          </button>

          <button
            type="button"
            disabled={tailoringSummary || jobDescription.trim().length < 25}
            onClick={() => onTailorSummary(jobDescription)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-[#1C1C1C] bg-white border border-[#DDDAD3] hover:border-[#1C1C1C] disabled:opacity-50 rounded-[6px] transition-colors duration-150"
          >
            {tailoringSummary ? "Tailoring summary..." : "Tailor summary to posting"}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3.5 bg-white border border-[#C94E00] rounded-[6px] flex items-start gap-2.5 text-[13px] text-[#1C1C1C]"
        >
          <AlertCircle className="w-4 h-4 text-[#C94E00] shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="bg-white border border-[#DDDAD3] rounded-[6px] divide-y divide-[#EAE7DF]">
          {/* Score Header */}
          <div className="p-5">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <div className="text-[12px] font-medium text-[#686868]">
                  Estimated alignment
                </div>
                <div className="mt-1 font-display text-[28px] font-bold text-[#1C1C1C] tabular-nums leading-none">
                  {result.score}
                  <span className="text-[14px] font-medium text-[#686868]">
                    /100
                  </span>
                </div>
              </div>
              <div className="text-[12px] font-medium text-[#1C1C1C]">
                {result.score >= 80
                  ? "Strong alignment"
                  : result.score >= 60
                    ? "Moderate alignment"
                    : "Needs targeted edits"}
              </div>
            </div>

            <div className="mt-3 h-1.5 w-full bg-[#F0EDE6] rounded-[4px] overflow-hidden">
              <div
                className="h-full bg-[#E85D04] transition-all duration-200"
                style={{ width: `${result.score}%` }}
              />
            </div>

            {result.verdict && (
              <p className="mt-3.5 text-[13.5px] leading-[1.55] text-[#686868]">
                {result.verdict}
              </p>
            )}
          </div>

          {/* Keywords Breakdown */}
          <div className="p-5 space-y-4">
            <div>
              <div className="text-[12px] font-semibold text-[#1C1C1C] mb-1.5">
                Matched terms ({result.matchedKeywords.length})
              </div>
              {result.matchedKeywords.length > 0 ? (
                <p className="text-[13px] leading-[1.65] text-[#686868]">
                  {result.matchedKeywords.join(" · ")}
                </p>
              ) : (
                <p className="text-[13px] text-[#686868]">
                  No strong keyword overlap detected yet.
                </p>
              )}
            </div>

            <div>
              <div className="text-[12px] font-semibold text-[#C94E00] mb-2">
                Missing or understated terms ({result.missingKeywords.length})
              </div>
              {result.missingKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {result.missingKeywords.map((kw) => {
                    const added = addedSkills[kw];
                    return (
                      <button
                        key={kw}
                        type="button"
                        disabled={added}
                        onClick={() => handleAddSkill(kw)}
                        title="Add this term to your Skills section if applicable"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium rounded-[4px] border transition-colors duration-150 ${
                          added
                            ? "bg-[#F0EDE6] border-[#DDDAD3] text-[#686868]"
                            : "bg-[#F8F7F2] border-[#DDDAD3] text-[#1C1C1C] hover:border-[#E85D04] hover:text-[#E85D04]"
                        }`}
                      >
                        {added ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Plus className="w-3 h-3" />
                        )}
                        <span>{kw}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[13px] text-[#686868]">
                  Core terms from the posting are well represented.
                </p>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="p-5 space-y-3">
              <div className="text-[12px] font-semibold text-[#1C1C1C]">
                Recommended edits
              </div>
              <div className="space-y-3">
                {result.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="pb-3 last:pb-0 border-b last:border-b-0 border-[#F0EDE6]"
                  >
                    <div className="text-[12px] font-semibold text-[#E85D04]">
                      {rec.section}
                    </div>
                    <p className="mt-0.5 text-[13px] leading-[1.55] text-[#1C1C1C]">
                      {rec.advice}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
