import { useState, useEffect } from "react";
import { Globe, Bookmark, PlusCircle, CalendarDays, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOUR_KEY = "atlas_tour_completed";

const steps = [
  {
    icon: Globe,
    emoji: "🌍",
    title: "Discover Events",
    description: "Explore all campus events. Filter by category, type, or date to find what excites you.",
    color: "bg-primary text-primary-foreground",
  },
  {
    icon: Bookmark,
    emoji: "🔖",
    title: "Save & Remember",
    description: "Bookmark events you love. Set reminders so you never miss out on the good stuff.",
    color: "bg-warm-teal text-primary-foreground",
  },
  {
    icon: PlusCircle,
    emoji: "✨",
    title: "Create Events",
    description: "Host your own — from chill study sessions to campus-wide parties with RSVP management.",
    color: "bg-warm-coral text-primary-foreground",
  },
  {
    icon: CalendarDays,
    emoji: "📅",
    title: "Your Calendar",
    description: "All your events in one cozy spot — mandatory, saved, and private ones too.",
    color: "bg-warm-lavender text-primary-foreground",
  },
];

export default function FeatureTour() {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(TOUR_KEY, "true");
  };

  const next = () => {
    if (current < steps.length - 1) setCurrent(current + 1);
    else dismiss();
  };

  if (!visible) return null;

  const step = steps[current];

  return (
    <>
      <div className="tour-overlay" onClick={dismiss} />
      <div className="fixed inset-x-4 bottom-28 z-[9999] mx-auto max-w-sm animate-slide-up">
        <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-elevated">
          <button
            onClick={dismiss}
            className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Progress dots */}
          <div className="mb-5 flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  i <= current ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>

          <div key={current} className="animate-fade-in">
            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${step.color}`}>
              <span className="text-xl">{step.emoji}</span>
            </div>
            <h3 className="text-lg font-extrabold font-display">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={dismiss}
              className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
            <Button onClick={next} size="sm" className="gap-1.5 rounded-2xl px-5 font-bold shadow-soft">
              {current < steps.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              ) : (
                "Let's Go! 🎉"
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
