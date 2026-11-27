import React from "react";
import { ACCENT_PALETTE, ResumeData } from "../types/resume";

interface ResumePreviewProps {
  data: ResumeData;
  isPrintTarget?: boolean;
}

const DENSITY_SCALE = {
  compact: {
    padX: "px-[38px]",
    padY: "py-[36px]",
    bodyText: "text-[10.5px] leading-[1.48]",
    bulletGap: "space-y-1",
    sectionGap: "space-y-4",
    itemGap: "space-y-3",
  },
  standard: {
    padX: "px-[46px]",
    padY: "py-[44px]",
    bodyText: "text-[11.25px] leading-[1.56]",
    bulletGap: "space-y-1.5",
    sectionGap: "space-y-5",
    itemGap: "space-y-3.5",
  },
  relaxed: {
    padX: "px-[52px]",
    padY: "py-[50px]",
    bodyText: "text-[11.75px] leading-[1.64]",
    bulletGap: "space-y-2",
    sectionGap: "space-y-6",
    itemGap: "space-y-4",
  },
};

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  isPrintTarget = false,
}) => {
  const accentHex = ACCENT_PALETTE[data.accent]?.hex ?? "#1C1C1C";
  const density = DENSITY_SCALE[data.density ?? "standard"];
  const { personal, summary, experience, education, skills, projects } = data;

  const contactItems = [
    personal.email,
    personal.phone,
    personal.location,
    personal.website,
    personal.linkedin,
  ].filter((v) => v && v.trim().length > 0);

  const visibleExperience = experience.filter(
    (e) => e.role.trim() || e.company.trim() || e.bullets.some((b) => b.trim())
  );
  const visibleEducation = education.filter(
    (e) => e.degree.trim() || e.institution.trim()
  );
  const visibleSkills = skills.filter(
    (s) => s.category.trim() && s.items.length > 0
  );
  const visibleProjects = projects.filter(
    (p) => p.name.trim() || p.description.trim()
  );

  const displayName = personal.fullName.trim() || "Your Full Name";
  const displayHeadline = personal.headline.trim() || "Target Role or Title";

  if (data.template === "editorial") {
    return (
      <article
        className={`w-[794px] min-h-[1123px] bg-white text-[#1C1C1C] ${density.padX} ${density.padY} font-sans ${
          isPrintTarget ? "a4-sheet" : ""
        }`}
      >
        {/* Editorial Masthead */}
        <header className="pb-5 border-b border-[#1C1C1C]">
          <div className="flex items-baseline justify-between gap-6">
            <div>
              <h1 className="font-serif text-[30px] font-semibold tracking-[-0.02em] leading-[1.1] text-[#1C1C1C]">
                {displayName}
              </h1>
              <p
                className="mt-1.5 text-[13px] font-medium tracking-[0.01em]"
                style={{ color: accentHex }}
              >
                {displayHeadline}
              </p>
            </div>
            <div className="text-right text-[10.5px] leading-[1.55] text-[#686868]">
              {personal.location && <div>{personal.location}</div>}
              {personal.email && <div>{personal.email}</div>}
              {personal.phone && <div>{personal.phone}</div>}
            </div>
          </div>
          {(personal.website || personal.linkedin) && (
            <div className="mt-3 pt-2.5 border-t border-[#E6E4DD] flex items-center gap-4 text-[10.5px] text-[#686868]">
              {personal.website && <span>{personal.website}</span>}
              {personal.website && personal.linkedin && (
                <span aria-hidden="true">·</span>
              )}
              {personal.linkedin && <span>{personal.linkedin}</span>}
            </div>
          )}
        </header>

        <div className={`mt-5 ${density.sectionGap}`}>
          {summary.trim() && (
            <section>
              <h2 className="font-serif text-[13px] font-semibold text-[#1C1C1C] mb-1.5">
                Profile
              </h2>
              <p className={`${density.bodyText} text-[#2D2D2D]`}>{summary}</p>
            </section>
          )}

          {visibleExperience.length > 0 && (
            <section className="pt-3 border-t border-[#E6E4DD]">
              <h2 className="font-serif text-[13px] font-semibold text-[#1C1C1C] mb-3">
                Experience
              </h2>
              <div className={density.itemGap}>
                {visibleExperience.map((item) => (
                  <div key={item.id}>
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <span className="text-[12px] font-semibold text-[#1C1C1C]">
                          {item.role || "Role Title"}
                        </span>
                        {item.company && (
                          <span className="text-[12px] text-[#4A4A4A]">
                            {" "}
                            — {item.company}
                          </span>
                        )}
                      </div>
                      <span className="text-[10.5px] text-[#686868] tabular-nums whitespace-nowrap shrink-0">
                        {[
                          item.startDate,
                          item.current ? "Present" : item.endDate,
                        ]
                          .filter(Boolean)
                          .join(" – ")}
                        {item.location ? ` · ${item.location}` : ""}
                      </span>
                    </div>
                    {item.bullets.some((b) => b.trim()) && (
                      <ul
                        className={`mt-1.5 ${density.bulletGap} list-none pl-0`}
                      >
                        {item.bullets
                          .filter((b) => b.trim())
                          .map((b, idx) => (
                            <li
                              key={idx}
                              className={`${density.bodyText} text-[#2D2D2D] pl-3.5 relative`}
                            >
                              <span
                                className="absolute left-0 top-[0.55em] w-1 h-1 rounded-full"
                                style={{ backgroundColor: accentHex }}
                              />
                              {b}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleProjects.length > 0 && (
            <section className="pt-3 border-t border-[#E6E4DD]">
              <h2 className="font-serif text-[13px] font-semibold text-[#1C1C1C] mb-2.5">
                Selected Work & Publications
              </h2>
              <div className="space-y-2.5">
                {visibleProjects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-[11.5px] font-semibold text-[#1C1C1C]">
                        {proj.name}
                        {proj.role ? (
                          <span className="font-normal text-[#686868]">
                            {" "}
                            · {proj.role}
                          </span>
                        ) : null}
                      </span>
                      <span className="text-[10.5px] text-[#686868] tabular-nums">
                        {[proj.year, proj.link].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                    {proj.description && (
                      <p className={`mt-0.5 ${density.bodyText} text-[#2D2D2D]`}>
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="pt-3 border-t border-[#E6E4DD] grid grid-cols-12 gap-6">
            {visibleEducation.length > 0 && (
              <section className="col-span-6">
                <h2 className="font-serif text-[13px] font-semibold text-[#1C1C1C] mb-2">
                  Education
                </h2>
                <div className="space-y-2.5">
                  {visibleEducation.map((edu) => (
                    <div key={edu.id}>
                      <div className="text-[11.5px] font-semibold text-[#1C1C1C]">
                        {edu.degree}
                      </div>
                      <div className="text-[10.5px] text-[#4A4A4A]">
                        {[edu.institution, edu.location, edu.graduationDate]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                      {edu.details && (
                        <div className="mt-0.5 text-[10.5px] text-[#686868]">
                          {edu.details}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {visibleSkills.length > 0 && (
              <section
                className={
                  visibleEducation.length > 0 ? "col-span-6" : "col-span-12"
                }
              >
                <h2 className="font-serif text-[13px] font-semibold text-[#1C1C1C] mb-2">
                  Capabilities
                </h2>
                <div className="space-y-2">
                  {visibleSkills.map((grp) => (
                    <div key={grp.id} className={density.bodyText}>
                      <span className="font-semibold text-[#1C1C1C]">
                        {grp.category}:{" "}
                      </span>
                      <span className="text-[#4A4A4A]">
                        {grp.items.join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </article>
    );
  }

  if (data.template === "monolith") {
    return (
      <article
        className={`w-[794px] min-h-[1123px] bg-white text-[#1C1C1C] ${density.padX} ${density.padY} font-sans ${
          isPrintTarget ? "a4-sheet" : ""
        }`}
      >
        <header className="pb-4 border-b-2" style={{ borderColor: accentHex }}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-[26px] font-bold tracking-[-0.025em] leading-[1.08] text-[#1C1C1C]">
                {displayName}
              </h1>
              <p className="mt-1 font-mono text-[11.5px] text-[#4A4A4A]">
                {displayHeadline}
              </p>
            </div>
            <div className="text-right font-mono text-[9.5px] leading-[1.55] text-[#686868]">
              {contactItems.slice(0, 3).map((item, i) => (
                <div key={i}>{item}</div>
              ))}
            </div>
          </div>
          {contactItems.length > 3 && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[9.5px] text-[#686868]">
              {contactItems.slice(3).map((item, i) => (
                <span key={i}>{item}</span>
              ))}
            </div>
          )}
        </header>

        <div className={`mt-4 ${density.sectionGap}`}>
          {summary.trim() && (
            <section>
              <h2
                className="font-display text-[10.5px] font-bold uppercase tracking-[0.08em] mb-1.5"
                style={{ color: accentHex }}
              >
                Summary
              </h2>
              <p className={`${density.bodyText} text-[#2D2D2D]`}>{summary}</p>
            </section>
          )}

          {visibleSkills.length > 0 && (
            <section className="pt-3 border-t border-[#E6E4DD]">
              <h2
                className="font-display text-[10.5px] font-bold uppercase tracking-[0.08em] mb-2"
                style={{ color: accentHex }}
              >
                Technical Matrix
              </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                {visibleSkills.map((grp) => (
                  <div key={grp.id} className={density.bodyText}>
                    <span className="font-semibold text-[#1C1C1C]">
                      {grp.category}:{" "}
                    </span>
                    <span className="text-[#4A4A4A]">
                      {grp.items.join(" · ")}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleExperience.length > 0 && (
            <section className="pt-3 border-t border-[#E6E4DD]">
              <h2
                className="font-display text-[10.5px] font-bold uppercase tracking-[0.08em] mb-2.5"
                style={{ color: accentHex }}
              >
                Experience
              </h2>
              <div className={density.itemGap}>
                {visibleExperience.map((item) => (
                  <div key={item.id}>
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="text-[11.5px] font-semibold text-[#1C1C1C]">
                        {item.role || "Role Title"}
                        {item.company ? (
                          <span className="font-normal text-[#4A4A4A]">
                            {" "}
                            · {item.company}
                          </span>
                        ) : null}
                      </div>
                      <span className="font-mono text-[9.5px] text-[#686868] tabular-nums whitespace-nowrap shrink-0">
                        {[
                          item.startDate,
                          item.current ? "Present" : item.endDate,
                        ]
                          .filter(Boolean)
                          .join(" – ")}
                        {item.location ? ` / ${item.location}` : ""}
                      </span>
                    </div>
                    {item.bullets.some((b) => b.trim()) && (
                      <ul
                        className={`mt-1 ${density.bulletGap} list-none pl-0`}
                      >
                        {item.bullets
                          .filter((b) => b.trim())
                          .map((b, idx) => (
                            <li
                              key={idx}
                              className={`${density.bodyText} text-[#2D2D2D] pl-3 relative`}
                            >
                              <span className="absolute left-0 top-0 text-[#686868]">
                                –
                              </span>
                              {b}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleProjects.length > 0 && (
            <section className="pt-3 border-t border-[#E6E4DD]">
              <h2
                className="font-display text-[10.5px] font-bold uppercase tracking-[0.08em] mb-2"
                style={{ color: accentHex }}
              >
                Systems & Open Source
              </h2>
              <div className="space-y-2">
                {visibleProjects.map((proj) => (
                  <div key={proj.id} className="flex items-baseline justify-between gap-4">
                    <div className={density.bodyText}>
                      <span className="font-semibold text-[#1C1C1C]">
                        {proj.name}
                      </span>
                      {proj.description ? (
                        <span className="text-[#4A4A4A]">
                          {" "}
                          — {proj.description}
                        </span>
                      ) : null}
                    </div>
                    <span className="font-mono text-[9.5px] text-[#686868] whitespace-nowrap shrink-0">
                      {[proj.year, proj.link].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleEducation.length > 0 && (
            <section className="pt-3 border-t border-[#E6E4DD]">
              <h2
                className="font-display text-[10.5px] font-bold uppercase tracking-[0.08em] mb-2"
                style={{ color: accentHex }}
              >
                Education
              </h2>
              <div className="space-y-1.5">
                {visibleEducation.map((edu) => (
                  <div
                    key={edu.id}
                    className="flex items-baseline justify-between gap-4"
                  >
                    <div className={density.bodyText}>
                      <span className="font-semibold text-[#1C1C1C]">
                        {edu.degree}
                      </span>
                      {edu.institution ? (
                        <span className="text-[#4A4A4A]">
                          {" "}
                          · {edu.institution}
                        </span>
                      ) : null}
                      {edu.details ? (
                        <span className="text-[#686868]"> ({edu.details})</span>
                      ) : null}
                    </div>
                    <span className="font-mono text-[9.5px] text-[#686868] tabular-nums whitespace-nowrap shrink-0">
                      {[edu.location, edu.graduationDate]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    );
  }

  // Default: Zurich — Asymmetric Swiss Grid
  return (
    <article
      className={`w-[794px] min-h-[1123px] bg-white text-[#1C1C1C] ${density.padX} ${density.padY} font-sans ${
        isPrintTarget ? "a4-sheet" : ""
      }`}
    >
      {/* Swiss Header Block */}
      <header className="pb-5 border-b border-[#DDDAD3]">
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-8">
            <h1 className="font-display text-[29px] font-bold tracking-[-0.03em] leading-[1.06] text-[#1C1C1C]">
              {displayName}
            </h1>
            <p
              className="mt-1.5 font-display text-[13px] font-semibold tracking-[-0.01em]"
              style={{ color: accentHex }}
            >
              {displayHeadline}
            </p>
          </div>
          <div className="col-span-4 text-right text-[10px] leading-[1.55] text-[#686868]">
            {personal.email && <div className="text-[#1C1C1C] font-medium">{personal.email}</div>}
            {personal.phone && <div>{personal.phone}</div>}
            {personal.location && <div>{personal.location}</div>}
            {personal.website && <div>{personal.website}</div>}
            {personal.linkedin && <div>{personal.linkedin}</div>}
          </div>
        </div>
      </header>

      {/* Two-column Asymmetric Grid */}
      <div className="mt-6 grid grid-cols-12 gap-8">
        {/* Left Sidebar Column (4 cols) */}
        <aside className="col-span-4 pr-5 border-r border-[#EAE7DF] space-y-6">
          {visibleSkills.length > 0 && (
            <section>
              <h2 className="font-display text-[10px] font-bold uppercase tracking-[0.09em] text-[#686868] mb-2.5">
                Expertise
              </h2>
              <div className="space-y-3">
                {visibleSkills.map((grp) => (
                  <div key={grp.id}>
                    <div className="text-[10.5px] font-semibold text-[#1C1C1C] mb-1">
                      {grp.category}
                    </div>
                    <ul className="space-y-0.5 text-[10.5px] leading-[1.45] text-[#4A4A4A]">
                      {grp.items.map((skill, idx) => (
                        <li key={idx}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleEducation.length > 0 && (
            <section className="pt-4 border-t border-[#EAE7DF]">
              <h2 className="font-display text-[10px] font-bold uppercase tracking-[0.09em] text-[#686868] mb-2.5">
                Education
              </h2>
              <div className="space-y-3">
                {visibleEducation.map((edu) => (
                  <div key={edu.id}>
                    <div className="text-[11px] font-semibold text-[#1C1C1C] leading-[1.35]">
                      {edu.degree}
                    </div>
                    <div className="mt-0.5 text-[10.5px] text-[#4A4A4A]">
                      {edu.institution}
                    </div>
                    <div className="mt-0.5 text-[10px] text-[#686868] tabular-nums">
                      {[edu.location, edu.graduationDate]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                    {edu.details && (
                      <p className="mt-1 text-[10px] leading-[1.45] text-[#686868]">
                        {edu.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleProjects.length > 0 && (
            <section className="pt-4 border-t border-[#EAE7DF]">
              <h2 className="font-display text-[10px] font-bold uppercase tracking-[0.09em] text-[#686868] mb-2.5">
                Projects
              </h2>
              <div className="space-y-2.5">
                {visibleProjects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[11px] font-semibold text-[#1C1C1C]">
                        {proj.name}
                      </span>
                      {proj.year && (
                        <span className="text-[10px] text-[#686868] tabular-nums">
                          {proj.year}
                        </span>
                      )}
                    </div>
                    {proj.link && (
                      <div className="text-[9.5px] text-[#686868] truncate">
                        {proj.link}
                      </div>
                    )}
                    {proj.description && (
                      <p className="mt-0.5 text-[10px] leading-[1.45] text-[#4A4A4A]">
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>

        {/* Main Content Column (8 cols) */}
        <main className={`col-span-8 ${density.sectionGap}`}>
          {summary.trim() && (
            <section>
              <h2 className="font-display text-[10px] font-bold uppercase tracking-[0.09em] text-[#686868] mb-2">
                Profile
              </h2>
              <p className={`${density.bodyText} text-[#2D2D2D]`}>{summary}</p>
            </section>
          )}

          {visibleExperience.length > 0 && (
            <section className={summary.trim() ? "pt-4 border-t border-[#EAE7DF]" : ""}>
              <h2 className="font-display text-[10px] font-bold uppercase tracking-[0.09em] text-[#686868] mb-3">
                Experience
              </h2>
              <div className={density.itemGap}>
                {visibleExperience.map((item) => (
                  <div key={item.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-[12.5px] font-semibold text-[#1C1C1C]">
                        {item.role || "Role Title"}
                      </h3>
                      <span className="text-[10px] text-[#686868] tabular-nums whitespace-nowrap shrink-0">
                        {[
                          item.startDate,
                          item.current ? "Present" : item.endDate,
                        ]
                          .filter(Boolean)
                          .join(" – ")}
                      </span>
                    </div>
                    <div className="text-[10.5px] font-medium text-[#4A4A4A] mt-0.5">
                      {[item.company, item.location].filter(Boolean).join(" · ")}
                    </div>
                    {item.bullets.some((b) => b.trim()) && (
                      <ul
                        className={`mt-2 ${density.bulletGap} list-none pl-0`}
                      >
                        {item.bullets
                          .filter((b) => b.trim())
                          .map((b, idx) => (
                            <li
                              key={idx}
                              className={`${density.bodyText} text-[#2D2D2D] pl-3.5 relative`}
                            >
                              <span
                                className="absolute left-0 top-[0.58em] w-1.5 h-[1.5px]"
                                style={{ backgroundColor: accentHex }}
                              />
                              {b}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </article>
  );
};
