import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const MODEL_NAME = "gemini-4-hydrogen";

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please add it in Settings > Secrets."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function mapGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes("GEMINI_API_KEY is not configured")) {
    return { status: 503, message: raw };
  }
  if (raw.includes("PERMISSION_DENIED") || raw.includes("API_KEY_INVALID") || raw.includes("403") || raw.includes("401")) {
    return {
      status: 401,
      message: "Gemini API key was rejected. Please verify your key in Settings > Secrets.",
    };
  }
  if (raw.includes("RESOURCE_EXHAUSTED") || raw.includes("429")) {
    return {
      status: 429,
      message: "AI request quota reached. Please try again shortly.",
    };
  }
  return {
    status: 500,
    message: "Unable to complete the AI request right now. Please try again.",
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "512kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/ai/rewrite", async (req, res) => {
    try {
      const { mode, content, context } = req.body ?? {};
      const allowedModes = new Set([
        "summary_draft",
        "summary_tighten",
        "bullets_improve",
        "bullets_quantify",
        "bullets_draft",
        "tailor_summary",
      ]);

      if (typeof mode !== "string" || !allowedModes.has(mode)) {
        res.status(400).json({ error: "Invalid rewrite mode requested." });
        return;
      }

      const safeContent = typeof content === "string" ? content.slice(0, 6000).trim() : "";
      const ctx = context && typeof context === "object" ? context : {};
      const roleTitle = typeof ctx.roleTitle === "string" ? ctx.roleTitle.slice(0, 160) : "";
      const company = typeof ctx.company === "string" ? ctx.company.slice(0, 160) : "";
      const targetRole = typeof ctx.targetRole === "string" ? ctx.targetRole.slice(0, 160) : "";
      const jobDescription =
        typeof ctx.jobDescription === "string" ? ctx.jobDescription.slice(0, 8000) : "";
      const skills = Array.isArray(ctx.skills)
        ? ctx.skills.filter((s: unknown) => typeof s === "string").slice(0, 30).join(", ")
        : "";

      let prompt = "";
      let systemInstruction =
        "You are an experienced senior career editor who writes crisp, concrete, human-sounding résumé prose. Avoid cliché buzzwords like 'spearheaded', 'synergy', 'dynamic', 'rockstar', 'passionate', 'leveraged', or 'elevated'. Use plain, active verbs, specific scope, and measurable outcomes. Do not invent fake numbers if none are implied—use realistic structure or [X%] placeholders only when quantifying missing metrics. Return ONLY the rewritten text with no preamble, markdown headers, or commentary.";

      if (mode === "summary_draft") {
        prompt = `Write a concise 2-to-3 sentence professional summary (50–70 words) for a résumé.\nTarget Role: ${targetRole || roleTitle || "Not specified"}\nCore Skills: ${skills || "Not specified"}\nExisting Notes / Draft: ${safeContent || "None provided — draft a clear, grounded starting summary based on the role and skills."}`;
      } else if (mode === "summary_tighten") {
        if (!safeContent) {
          res.status(400).json({ error: "Enter a draft summary before tightening." });
          return;
        }
        prompt = `Tighten and clarify this résumé professional summary to 2–3 crisp sentences (under 65 words). Preserve facts and tone, remove filler.\nTarget Role: ${targetRole || "General"}\nDraft:\n${safeContent}`;
      } else if (mode === "tailor_summary") {
        if (!jobDescription) {
          res.status(400).json({ error: "Paste a job description first to tailor your summary." });
          return;
        }
        prompt = `Tailor this résumé professional summary to align honestly with the target job description (2–3 sentences, under 70 words). Emphasize relevant experience already present.\nCurrent Summary:\n${safeContent || "None"}\nTarget Role: ${targetRole || "Not specified"}\nSkills: ${skills}\nJob Description:\n${jobDescription}`;
      } else if (mode === "bullets_improve") {
        if (!safeContent) {
          res.status(400).json({ error: "Add at least one bullet point to refine." });
          return;
        }
        prompt = `Refine these résumé bullet points for clarity, strong plain-English verbs, and concise scannability. Keep one bullet per line without leading bullet symbols (no '-' or '•' at the start of lines). Preserve the exact factual achievements.\nRole: ${roleTitle} at ${company}\nBullets:\n${safeContent}`;
      } else if (mode === "bullets_quantify") {
        if (!safeContent) {
          res.status(400).json({ error: "Add bullet points first to sharpen impact." });
          return;
        }
        prompt = `Rewrite these résumé bullet points to highlight concrete scope, scale, and outcomes. Where a metric isn't provided, insert a clean bracketed placeholder like [X%] or [$X] so the author can fill in their exact figure. Return one bullet per line without leading bullet characters.\nRole: ${roleTitle} at ${company}\nBullets:\n${safeContent}`;
      } else if (mode === "bullets_draft") {
        if (!roleTitle) {
          res.status(400).json({ error: "Enter a job title first to generate starting bullet points." });
          return;
        }
        prompt = `Draft 3 realistic, concrete résumé bullet points for the role below. Use clean bracketed placeholders like [X%] or [N] where specific metrics belong so the author can customize them. Return one bullet per line without leading bullet characters.\nRole Title: ${roleTitle}\nCompany: ${company || "Company"}\nNotes: ${safeContent || "None"}`;
      }

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      const text = (response.text ?? "").trim();
      if (!text) {
        res.status(502).json({ error: "Empty response received from writing assistant." });
        return;
      }

      res.json({ result: text });
    } catch (err) {
      const mapped = mapGeminiError(err);
      res.status(mapped.status).json({ error: mapped.message });
    }
  });

  app.post("/api/ai/ats-analyze", async (req, res) => {
    try {
      const { resume, jobDescription } = req.body ?? {};
      if (typeof jobDescription !== "string" || jobDescription.trim().length < 25) {
        res.status(400).json({
          error: "Please paste a job description (at least 25 characters) to run an ATS alignment check.",
        });
        return;
      }
      if (!resume || typeof resume !== "object") {
        res.status(400).json({ error: "Missing résumé data." });
        return;
      }

      const serializedResume = JSON.stringify(resume).slice(0, 18000);
      const safeJd = jobDescription.slice(0, 12000).trim();

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Evaluate how well the following résumé aligns with the target job description for both Applicant Tracking System (ATS) keyword coverage and human hiring manager clarity.\n\nRÉSUMÉ JSON:\n${serializedResume}\n\nTARGET JOB DESCRIPTION:\n${safeJd}`,
        config: {
          systemInstruction:
            "You are a candid technical & editorial recruiting advisor. Score alignment strictly and realistically (0 to 100) based on actual overlap between the résumé text and the job description requirements. Never flatter or inflate scores. Identify exact matched skills/terms, concrete missing keywords from the job posting, and 3 to 5 specific, actionable edits grounded in the user's existing sections.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: {
                type: Type.INTEGER,
                description: "Realistic ATS & role alignment score from 0 to 100.",
              },
              verdict: {
                type: Type.STRING,
                description: "Concise 2-sentence editorial assessment of fit and biggest gap.",
              },
              matchedKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Important skills/terms found in both the résumé and the job description (up to 15).",
              },
              missingKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Important skills/terms required in the job description that are absent or understated in the résumé (up to 12).",
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    section: {
                      type: Type.STRING,
                      description: "Target résumé section (e.g. Summary, Experience, Skills, Projects).",
                    },
                    advice: {
                      type: Type.STRING,
                      description: "Concrete, specific improvement in 1-2 sentences.",
                    },
                  },
                },
                description: "3 to 5 actionable recommendations.",
              },
            },
          },
        },
      });

      const rawJson = (response.text ?? "{}").trim();
      const parsed = JSON.parse(rawJson);

      res.json({
        score: typeof parsed.score === "number" ? Math.max(0, Math.min(100, Math.round(parsed.score))) : 0,
        verdict: typeof parsed.verdict === "string" ? parsed.verdict : "",
        matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords.slice(0, 15) : [],
        missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords.slice(0, 12) : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 6) : [],
      });
    } catch (err) {
      const mapped = mapGeminiError(err);
      res.status(mapped.status).json({ error: mapped.message });
    }
  });

  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ResumeCraft AI server running on http://localhost:${PORT}`);
  });
}

startServer();
