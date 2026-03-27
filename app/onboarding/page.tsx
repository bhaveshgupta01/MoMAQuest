"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PreferenceSelector } from "@/components/onboarding/PreferenceSelector";
import { useGame } from "@/context/GameContext";
import { UserPreferences } from "@/lib/types";

const INTERESTS = [
  { label: "Bold colors & emotion", emoji: "🎨", value: "bold_colors" },
  { label: "Hidden details & symbolism", emoji: "🔍", value: "symbolism" },
  { label: "Social media favorites", emoji: "📸", value: "iconic" },
  { label: "Design & architecture", emoji: "🏛️", value: "design" },
  { label: "Photography", emoji: "📷", value: "photography" },
  { label: "Weird & experimental", emoji: "🌀", value: "experimental" },
  { label: "The greatest hits", emoji: "⭐", value: "masterpieces" },
  { label: "Underrated gems", emoji: "💎", value: "underrated" },
];

const TIMES = [
  { label: "Quick visit (45 min)", emoji: "⚡", value: "45min" },
  { label: "A good explore (90 min)", emoji: "🚶", value: "90min" },
  { label: "I've got all day", emoji: "☀️", value: "allday" },
];

const VIBES = [
  { label: "Surprise me", emoji: "🎲", value: "surprise" },
  { label: "Deep dive on a few", emoji: "🤿", value: "deep_dive" },
  { label: "I want the icons", emoji: "🌟", value: "icons" },
  { label: "Show me the underrated", emoji: "🗝️", value: "underrated" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { setPreferences, setQuest } = useGame();
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [time, setTime] = useState<string>("");
  const [vibe, setVibe] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const steps = [
    {
      question: "What draws you in?",
      subtitle: "Pick as many as you like",
      content: (
        <PreferenceSelector
          options={INTERESTS}
          selected={interests}
          onToggle={(v) =>
            setInterests((prev) =>
              prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
            )
          }
          multi
        />
      ),
      canProceed: interests.length > 0,
    },
    {
      question: "How long are you staying?",
      subtitle: "We'll build a route that fits",
      content: (
        <PreferenceSelector
          options={TIMES}
          selected={time ? [time] : []}
          onToggle={(v) => setTime(v)}
          multi={false}
        />
      ),
      canProceed: !!time,
    },
    {
      question: "What kind of experience?",
      subtitle: "Set the vibe for your quest",
      content: (
        <PreferenceSelector
          options={VIBES}
          selected={vibe ? [vibe] : []}
          onToggle={(v) => setVibe(v)}
          multi={false}
        />
      ),
      canProceed: !!vibe,
    },
  ];

  async function handleNext() {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    // Final step — generate quest
    const prefs: UserPreferences = { interests, timeAvailable: time, vibe };
    setPreferences(prefs);
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: prefs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuest(data.quest, data.quest.taste_profile);
      router.push("/quest");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      setLoading(false);
    }
  }

  const current = steps[step];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        <div className="w-12 h-12 rounded-full border-4 border-secondary border-t-primary animate-spin" />
        <div className="text-center">
          <p className="font-display text-2xl text-foreground">Building your quest…</p>
          <p className="text-sm text-muted-foreground mt-1">Curating your personal adventure</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-5 pt-12 pb-8">
      {/* Progress bar */}
      <div className="flex gap-1 mb-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i <= step ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>

      <h2 className="font-display text-3xl text-foreground mb-1">{current.question}</h2>
      <p className="text-sm text-muted-foreground mb-6">{current.subtitle}</p>

      <div className="flex-1">{current.content}</div>

      {error && (
        <p className="text-sm text-red-500 text-center my-3">{error}</p>
      )}

      <div className="pt-6">
        <Button
          size="lg"
          onClick={handleNext}
          disabled={!current.canProceed || loading}
        >
          {step === steps.length - 1
            ? "Build my quest →"
            : "Next →"}
        </Button>
      </div>
    </div>
  );
}
