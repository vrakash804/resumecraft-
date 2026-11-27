import React, { useState } from "react";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  onCreateNew: () => void;
  onLoadSample: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onCreateNew,
  onLoadSample,
  onNavigateSection,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id: string) => {
    setMobileOpen(false);
    onNavigateSection(id);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F8F7F2]/95 border-b border-[#DDDAD3] no-print">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between gap-8">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="font-display text-[17px] font-bold tracking-[-0.02em] text-[#1C1C1C] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E85D04]"
        >
          ResumeCraft AI
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[#686868]"
        >
          <a
            href="#templates"
            onClick={(e) => {
              e.preventDefault();
              handleNav("templates");
            }}
            className="hover:text-[#1C1C1C] transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#1C1C1C]"
          >
            Templates
          </a>
          <a
            href="#workflow"
            onClick={(e) => {
              e.preventDefault();
              handleNav("workflow");
            }}
            className="hover:text-[#1C1C1C] transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#1C1C1C]"
          >
            Workflow
          </a>
          <a
            href="#ats-overview"
            onClick={(e) => {
              e.preventDefault();
              handleNav("ats-overview");
            }}
            className="hover:text-[#1C1C1C] transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#1C1C1C]"
          >
            ATS Check
          </a>
          <button
            type="button"
            onClick={onLoadSample}
            className="hover:text-[#1C1C1C] transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#1C1C1C]"
          >
            Open Sample
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onCreateNew}
            className="px-4 py-2 text-[14px] font-medium text-white bg-[#E85D04] hover:bg-[#C94E00] rounded-[6px] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1C1C]"
          >
            Create résumé
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-2 text-[#1C1C1C] border border-[#DDDAD3] rounded-[6px] bg-white hover:bg-[#F0EDE6] transition-colors duration-150"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#DDDAD3] bg-[#F8F7F2] px-6 py-4 flex flex-col gap-3 text-[15px] font-medium text-[#1C1C1C]">
          <a
            href="#templates"
            onClick={(e) => {
              e.preventDefault();
              handleNav("templates");
            }}
            className="py-1.5 text-[#686868] hover:text-[#1C1C1C]"
          >
            Templates
          </a>
          <a
            href="#workflow"
            onClick={(e) => {
              e.preventDefault();
              handleNav("workflow");
            }}
            className="py-1.5 text-[#686868] hover:text-[#1C1C1C]"
          >
            Workflow
          </a>
          <a
            href="#ats-overview"
            onClick={(e) => {
              e.preventDefault();
              handleNav("ats-overview");
            }}
            className="py-1.5 text-[#686868] hover:text-[#1C1C1C]"
          >
            ATS Check
          </a>
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onLoadSample();
            }}
            className="py-1.5 text-left text-[#686868] hover:text-[#1C1C1C]"
          >
            Open Sample
          </button>
        </div>
      )}
    </header>
  );
};
