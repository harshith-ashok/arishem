import { useState } from "react";
import axios from "axios";

/* ================= TYPES ================= */

type Evaluation = {
  score: string;
  impression: string;
  strengths: string[];
  risks: string[];
  weakness: string;
  improvement: string;
  title_suggestions: {
    high_score_variations: string[];
    theme_aligned_variations: string[];
  };
};

export default function App() {
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("Open Event");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  /* ================= AI CALL ================= */

  async function evaluateIdea() {
    setLoading(true);

    const model = "qwen3:8b";

    const prompt = `
You are an experienced hackathon judge who has evaluated more than 1,000 startup and hackathon submissions.

You act as a STRICT PRE-SCREENING FILTER.

CONTEXT:
- Judges review 50–200 submissions
- 2–4 minutes attention
- Clarity, impact, novelty, feasibility matter most
- Generic AI ideas are penalized

INPUTS

IDEA TITLE:
${title || "Not provided"}

HACKATHON THEME:
${theme || "Not provided"}

IDEA DESCRIPTION:
${description || "Not provided"}

TASK:
Evaluate quickly like a real judge.

OUTPUT RULES:
Return STRICT JSON ONLY.
No markdown.
No explanations.
Must start with { and end with }.
Score MUST always be formatted as "number/100".

RETURN EXACTLY:

{
  "score": "number/100",
  "impression": "short 2 sentence judge impression",
  "strengths": ["string", "string", "string"],
  "risks": ["string", "string", "string"],
  "weakness": "single biggest weakness",
  "improvement": "highest impact improvement action",
  "title_suggestions": {
    "high_score_variations": ["string", "string"],
    "theme_aligned_variations": ["string", "string", "string"]
  }
}
`;

    try {
      const res = await axios.post("http://localhost:11434/api/generate", {
        model,
        prompt,
        stream: false,
      });

      const text: string = res.data.response;

      console.log("RAW MODEL OUTPUT:", text);

      /* ===== SAFE JSON EXTRACTION ===== */
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");

      if (start === -1 || end === -1) {
        throw new Error("JSON not found");
      }

      const parsed: Evaluation = JSON.parse(text.slice(start, end + 1));

      /* ===== FAILSAFE DEFAULTS ===== */
      if (!parsed.title_suggestions) {
        parsed.title_suggestions = {
          high_score_variations: [],
          theme_aligned_variations: [],
        };
      }

      setEvaluation(parsed);
    } catch (err) {
      console.error(err);
      alert("Failed to parse AI response.");
    }

    setLoading(false);
  }

  /* ================= UI ================= */

  return (
    <div className="bg-background-light text-[#1e1e2d] font-display min-h-screen">
      {/* HEADER */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#e7e7f3] bg-white/80 backdrop-blur-md px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
            ⚖️
          </div>
          <div>
            <h2 className="text-lg font-bold">HackJudge</h2>
            <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
              AI Analysis Engine
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto flex flex-col lg:flex-row min-h-screen">
        {/* ================= LEFT PANEL ================= */}
        <section className="w-full lg:w-2/3 p-6 lg:p-10 space-y-8 overflow-y-auto">
          {/* TITLE */}
          <div className="border-b border-[#e7e7f3] pb-8">
            <h1 className="text-3xl font-black tracking-tight">
              Hackathon Idea Evaluator
            </h1>
            <p className="text-[#4b4c9b] mt-1">
              Project:
              <span className="font-medium text-[#0d0d1c] ml-1">
                {title || "—"}
              </span>
            </p>
          </div>

          {/* SCORE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-[#cfcfe8] shadow-sm text-center">
              <p className="text-xs font-bold text-[#4b4c9b] uppercase">
                Overall Score
              </p>

              <div className="flex items-end justify-center gap-1">
                <span className="text-5xl font-black text-primary">
                  {evaluation?.score?.split("/")[0] || "--"}
                </span>
                <span className="text-xl text-[#cfcfe8] font-bold">/100</span>
              </div>
            </div>

            <div className="md:col-span-2 bg-white p-6 rounded-xl border border-[#cfcfe8] shadow-sm">
              <h3 className="font-bold mb-3">30-Second Judge Impression</h3>
              <p className="text-[#4b4c9b] text-sm italic">
                {evaluation?.impression ||
                  "Your AI judge evaluation will appear here."}
              </p>
            </div>
          </div>

          {/* STRENGTHS + RISKS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-[#cfcfe8] shadow-sm">
              <h3 className="font-bold mb-4 text-green-600">What Works Well</h3>
              <ul className="space-y-2 text-sm text-[#4b4c9b]">
                {evaluation?.strengths?.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#cfcfe8] shadow-sm">
              <h3 className="font-bold mb-4 text-red-500">
                Major Rejection Risks
              </h3>
              {evaluation?.risks?.map((r, i) => (
                <p key={i} className="text-sm text-[#4b4c9b]">
                  <span className="font-bold text-[#0d0d1c]">{i + 1}.</span> {r}
                </p>
              ))}
            </div>
          </div>

          {/* WEAKNESS + IMPROVEMENT */}
          <div className="space-y-6">
            <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl">
              <h3 className="font-bold text-orange-700 mb-2">
                Biggest Weakness
              </h3>
              <p className="text-sm text-orange-800">{evaluation?.weakness}</p>
            </div>

            <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl">
              <h3 className="font-bold text-primary mb-2">
                Highest-Impact Improvement
              </h3>
              <p className="text-sm">{evaluation?.improvement}</p>
            </div>

            {/* TITLE SUGGESTIONS */}
            <div className="bg-white p-6 rounded-xl border border-[#cfcfe8] shadow-sm">
              <h3 className="font-bold mb-4">Title Suggestions</h3>

              <p className="text-xs font-bold text-primary mb-2">
                High-Score Variations
              </p>
              <ul className="space-y-1 text-sm">
                {evaluation?.title_suggestions?.high_score_variations
                  ?.length ? (
                  evaluation.title_suggestions.high_score_variations.map(
                    (t, i) => <li key={i}>• {t}</li>,
                  )
                ) : (
                  <li>No suggestions generated</li>
                )}
              </ul>

              <p className="text-xs font-bold text-primary mt-4 mb-2">
                Theme-Aligned Variations
              </p>
              <ul className="space-y-1 text-sm">
                {evaluation?.title_suggestions?.theme_aligned_variations
                  ?.length ? (
                  evaluation.title_suggestions.theme_aligned_variations.map(
                    (t, i) => <li key={i}>• {t}</li>,
                  )
                ) : (
                  <li>No suggestions generated</li>
                )}
              </ul>
            </div>
          </div>
        </section>

        {/* ================= RIGHT PANEL ================= */}
        <aside className="w-full lg:w-1/3 bg-white border-l border-[#e7e7f3] p-6">
          <div className="space-y-4">
            <h3 className="font-bold">Project Controls</h3>

            <input
              placeholder="Idea Title"
              className="w-full px-4 py-2 border rounded-lg bg-[#f8f8fc]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <select
              className="w-full px-4 py-2 border rounded-lg bg-[#f8f8fc]"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option>Open Event</option>
              <option>Sustainability & GreenTech</option>
              <option>FinTech Innovation</option>
              <option>AI & Machine Learning</option>
              <option>Social Impact</option>
            </select>

            <textarea
              rows={5}
              placeholder="Describe your hackathon idea..."
              className="w-full px-4 py-2 border rounded-lg bg-[#f8f8fc]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button
              onClick={evaluateIdea}
              className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg hover:bg-[#3235d1]"
            >
              {loading ? "Evaluating..." : "Evaluate Idea"}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
