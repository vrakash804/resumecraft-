import { useEffect, useState } from "react";
import { EditorWorkspace } from "./components/EditorWorkspace";
import { LandingPage } from "./components/LandingPage";
import {
  createBlankResume,
  SAMPLE_BY_TEMPLATE,
  SAMPLE_RESUME_ZURICH,
} from "./data/sampleResumes";
import { EditorSectionId, ResumeData, TemplateId } from "./types/resume";

const STORAGE_KEY = "resumecraft_ai_draft_v1";

function loadStoredResume(): ResumeData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.personal) {
      return parsed as ResumeData;
    }
    return null;
  } catch {
    return null;
  }
}

export default function App() {
  const [view, setView] = useState<"landing" | "editor">("landing");
  const [initialSection, setInitialSection] =
    useState<EditorSectionId>("personal");
  const [resume, setResume] = useState<ResumeData>(
    () => loadStoredResume() ?? SAMPLE_RESUME_ZURICH
  );

  // Auto-persist changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
    } catch {
      // Ignore quota errors cleanly
    }
  }, [resume]);

  const handleSave = () => {
    const stamped = { ...resume, updatedAt: new Date().toISOString() };
    setResume(stamped);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stamped));
    } catch {
      // Ignore quota errors cleanly
    }
  };

  const handleCreateNew = (template: TemplateId = "zurich") => {
    const existing = loadStoredResume();
    // If user already started editing a custom draft, preserve it or start blank if untouched sample
    if (
      existing &&
      existing.id &&
      !existing.id.startsWith("sample-")
    ) {
      setResume({ ...existing, template });
    } else {
      setResume(createBlankResume(template));
    }
    setInitialSection("personal");
    setView("editor");
    window.scrollTo({ top: 0 });
  };

  const handleOpenSample = (template: TemplateId = "zurich") => {
    const sample = SAMPLE_BY_TEMPLATE[template];
    setResume({
      ...sample,
      id: `sample-${template}-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    });
    setInitialSection("personal");
    setView("editor");
    window.scrollTo({ top: 0 });
  };

  const handleOpenAts = () => {
    setInitialSection("ats");
    setView("editor");
    window.scrollTo({ top: 0 });
  };

  if (view === "editor") {
    return (
      <EditorWorkspace
        resume={resume}
        onChange={setResume}
        onSave={handleSave}
        onBackToLanding={() => {
          setView("landing");
          window.scrollTo({ top: 0 });
        }}
        initialSection={initialSection}
      />
    );
  }

  return (
    <LandingPage
      onCreateNew={handleCreateNew}
      onOpenSample={handleOpenSample}
      onOpenAts={handleOpenAts}
    />
  );
}
