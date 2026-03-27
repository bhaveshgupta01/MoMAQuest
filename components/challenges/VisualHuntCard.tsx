"use client";

import { useState } from "react";
import { VisualHuntChallenge, HuntObject } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface VisualHuntCardProps {
  hunt: VisualHuntChallenge;
  streak: number;
  paintingTitle?: string;
  nextStop?: { title: string; currentLocation: string; connection_to_next?: string };
  onSubmit: (score: number, spottedLabels: string[], secretUnlocked: boolean) => void;
  onNavigateNext?: () => void;
}

type Phase = "hunt" | "revealed" | "verifying" | "followup_done" | "done";

function scoreHunt(
  objects: HuntObject[],
  selected: Set<string>,
  pointsPerHit: number,
  pointsPerSkip: number
): { score: number; hits: string[]; correctSkips: string[]; wrongSelections: string[] } {
  let score = 0;
  const hits: string[] = [];
  const correctSkips: string[] = [];
  const wrongSelections: string[] = [];

  for (const obj of objects) {
    const userSelected = selected.has(obj.label);
    if (obj.present && userSelected) {
      score += pointsPerHit;
      hits.push(obj.label);
    } else if (!obj.present && !userSelected) {
      score += pointsPerSkip;
      correctSkips.push(obj.label);
    } else if (!obj.present && userSelected) {
      wrongSelections.push(obj.label);
    }
  }

  return { score, hits, correctSkips, wrongSelections };
}

export function VisualHuntCard({ hunt, streak, paintingTitle, nextStop, onSubmit, onNavigateNext }: VisualHuntCardProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<Phase>("hunt");
  const [showHints, setShowHints] = useState<Set<string>>(new Set());
  const [huntScore, setHuntScore] = useState(0);
  const [hits, setHits] = useState<string[]>([]);
  const [wrongSelections, setWrongSelections] = useState<string[]>([]);
  const [followUpText, setFollowUpText] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [finalScore, setFinalScore] = useState(0);

  const multiplier = streak >= 3 ? 1.5 : 1;

  function toggle(label: string) {
    if (phase !== "hunt") return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) { next.delete(label); } else { next.add(label); }
      return next;
    });
  }

  function toggleHint(label: string) {
    setShowHints((prev) => {
      const next = new Set(prev);
      if (next.has(label)) { next.delete(label); } else { next.add(label); }
      return next;
    });
  }

  function handleSubmitHunt() {
    const result = scoreHunt(
      hunt.objects,
      selected,
      hunt.points_per_hit,
      hunt.points_per_skip
    );
    const baseScore = Math.round(result.score * multiplier);
    setHuntScore(baseScore);
    setFinalScore(baseScore);
    setHits(result.hits);
    setWrongSelections(result.wrongSelections);
    setPhase("revealed");
  }

  function handleSkipFollowUp() {
    onSubmit(huntScore, hits, hits.length >= 2);
    setFinalScore(huntScore);
    setPhase("done");
  }

  async function handleSubmitFollowUp() {
    if (!followUpText.trim()) return;
    setPhase("verifying");

    try {
      const res = await fetch("/api/verify-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: hunt.follow_up.question,
          answer: followUpText,
          sampleAnswer: hunt.follow_up.sample_answer,
          paintingTitle: paintingTitle ?? String(hunt.painting_id),
        }),
      });
      const data = await res.json();
      const bonusScore: number = data.score ?? 15;
      const total = huntScore + bonusScore;
      setFinalScore(total);
      setAiFeedback(data.feedback ?? "");
      onSubmit(total, hits, hits.length >= 2);
    } catch {
      // Fallback: award full points
      const total = huntScore + hunt.follow_up.points;
      setFinalScore(total);
      onSubmit(total, hits, hits.length >= 2);
    }

    setPhase("followup_done");
  }

  if (phase === "done" || phase === "followup_done") {
    const bonusEarned = finalScore - huntScore;
    return (
      <div className="rounded-3xl border-2 border-emerald-400 bg-emerald-50 overflow-hidden">
        <div className="p-5 text-center">
          <div className="text-3xl mb-2">✅</div>
          <p className="font-bold text-emerald-800 text-base">Stop complete!</p>
          <p className="text-sm text-emerald-700 mt-1">
            +{finalScore} pts earned
            {bonusEarned > 0 && ` (including +${bonusEarned} bonus)`}
          </p>
          {aiFeedback && (
            <p className="text-xs text-emerald-600 mt-2 italic leading-relaxed">
              &ldquo;{aiFeedback}&rdquo;
            </p>
          )}
        </div>

        {/* Sample answer reveal — only after bonus grading */}
        {phase === "followup_done" && (
          <div className="px-5 pb-1">
            <div className="rounded-2xl bg-white/60 border border-emerald-200 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">
                One perspective
              </p>
              <p className="text-xs text-emerald-900 leading-relaxed">{hunt.follow_up.sample_answer}</p>
            </div>
          </div>
        )}

        {/* Connection to next stop */}
        {nextStop?.connection_to_next && (
          <div className="px-5 pb-3 pt-2">
            <p className="text-xs text-emerald-700 italic leading-relaxed text-center">
              {nextStop.connection_to_next}
            </p>
          </div>
        )}

        {nextStop && (
          <div className="px-5 pb-4">
            <div className="rounded-2xl bg-white/70 border border-emerald-200 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Up next</p>
              <p className="text-sm font-semibold text-emerald-900 leading-tight">{nextStop.title}</p>
              <p className="text-xs text-emerald-600 mt-0.5">{nextStop.currentLocation}</p>
            </div>
          </div>
        )}

        {onNavigateNext && (
          <div className="px-5 pb-5">
            <Button size="lg" onClick={onNavigateNext}>
              {nextStop ? "Head to next stop →" : "Back to quest →"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (phase === "verifying") {
    return (
      <div className="rounded-3xl border-2 border-zinc-100 bg-white p-8 flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-zinc-500">Scoring your answer…</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-2 border-zinc-100 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🔍</span>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Visual Hunt
          </span>
          {multiplier > 1 && (
            <span className="text-xs font-bold text-orange-500 ml-auto">
              🔥 ×{multiplier} streak
            </span>
          )}
        </div>
        <p className="font-semibold text-zinc-900 text-sm leading-snug">
          {hunt.instruction}
        </p>
        {phase === "hunt" && (
          <p className="text-xs text-zinc-400 mt-1">
            Tap what you can see · +{hunt.points_per_hit} pts each · +{hunt.points_per_skip} pts for correctly skipping
          </p>
        )}
      </div>

      {/* Object grid */}
      <div className="px-5 py-4 grid grid-cols-2 gap-3">
        {hunt.objects.map((obj) => {
          const isSelected = selected.has(obj.label);
          const hintVisible = showHints.has(obj.label);

          // In hunt phase — normal selectable tiles
          if (phase === "hunt") {
            return (
              <div key={obj.label}>
                <button
                  onClick={() => toggle(obj.label)}
                  className={`w-full flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 transition-all active:scale-95 ${
                    isSelected
                      ? "border-black bg-zinc-900 text-white"
                      : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-400"
                  }`}
                >
                  <span className="text-2xl">{obj.emoji}</span>
                  <span className="text-xs font-semibold leading-tight text-center px-1">
                    {obj.label}
                  </span>
                </button>
                {obj.hint && (
                  <button
                    onClick={() => toggleHint(obj.label)}
                    className="text-[10px] text-zinc-400 underline mt-1 mx-auto block"
                  >
                    {hintVisible ? "hide hint" : "hint?"}
                  </button>
                )}
                {hintVisible && obj.hint && (
                  <p className="text-[10px] text-zinc-500 italic text-center mt-0.5 px-1">
                    {obj.hint}
                  </p>
                )}
              </div>
            );
          }

          // Revealed phase — show correct/wrong/missed
          const userSelected = selected.has(obj.label);
          let tileClass = "w-full flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 ";
          let badge = "";

          if (obj.present && userSelected) {
            tileClass += "border-emerald-400 bg-emerald-50 text-emerald-800";
            badge = "✓ spotted!";
          } else if (obj.present && !userSelected) {
            tileClass += "border-amber-300 bg-amber-50 text-amber-800";
            badge = "missed";
          } else if (!obj.present && userSelected) {
            tileClass += "border-red-300 bg-red-50 text-red-700";
            badge = "not there";
          } else {
            tileClass += "border-zinc-100 bg-zinc-50 text-zinc-400";
            badge = "✓ skipped";
          }

          return (
            <div key={obj.label} className={tileClass}>
              <span className="text-2xl">{obj.emoji}</span>
              <span className="text-xs font-semibold leading-tight text-center px-1">
                {obj.label}
              </span>
              <span className="text-[10px] font-bold opacity-70">{badge}</span>
            </div>
          );
        })}
      </div>

      {/* Reveal summary */}
      {phase === "revealed" && (
        <div className="px-5 pb-4 space-y-3">
          <div className="rounded-2xl bg-zinc-50 p-4">
            <p className="text-sm text-zinc-700 leading-relaxed">{hunt.reveal_text}</p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Hunt score</p>
                <p className="text-2xl font-black text-zinc-900">+{huntScore} pts</p>
                {wrongSelections.length > 0 && (
                  <p className="text-xs text-red-500 mt-0.5">
                    Not there: {wrongSelections.join(", ")}
                  </p>
                )}
              </div>
              {hits.length >= 2 && (
                <div className="text-right">
                  <p className="text-xs text-amber-600 font-semibold">🏛️ Secret unlocked!</p>
                </div>
              )}
            </div>
          </div>

          {/* Follow-up */}
          <div className="rounded-2xl border border-zinc-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              🧠 Bonus up to +{hunt.follow_up.points} pts
            </p>
            <p className="font-semibold text-zinc-900 text-sm mb-3 leading-snug">
              {hunt.follow_up.question}
            </p>
            <textarea
              className="w-full rounded-xl border border-zinc-200 p-3 text-sm resize-none focus:outline-none focus:border-zinc-400 min-h-[80px]"
              placeholder="What do you think…"
              value={followUpText}
              onChange={(e) => setFollowUpText(e.target.value)}
            />
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleSubmitFollowUp}
                disabled={!followUpText.trim()}
                className="flex-1"
              >
                Submit for AI scoring
              </Button>
              <button
                onClick={handleSkipFollowUp}
                className="px-4 text-sm text-zinc-400 hover:text-zinc-600"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit hunt button */}
      {phase === "hunt" && (
        <div className="px-5 pb-5">
          <Button
            size="lg"
            onClick={handleSubmitHunt}
            disabled={selected.size === 0}
          >
            Reveal answers
          </Button>
          <p className="text-center text-xs text-zinc-400 mt-2">
            Select everything you can spot, then reveal
          </p>
        </div>
      )}
    </div>
  );
}
