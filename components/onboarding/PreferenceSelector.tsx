"use client";

interface PreferenceSelectorProps {
  options: { label: string; emoji: string; value: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  multi?: boolean;
}

export function PreferenceSelector({
  options,
  selected,
  onToggle,
}: PreferenceSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => onToggle(opt.value)}
            className={`flex flex-col items-start gap-1 p-4 rounded-2xl border-2 text-left transition-all active:scale-95 ${
              isSelected
                ? "border-primary bg-secondary text-primary"
                : "border-border bg-white text-foreground hover:border-primary/40"
            }`}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <span className="text-sm font-semibold leading-tight">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
