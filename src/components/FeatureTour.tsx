import { useState, useEffect } from "react";
import { Globe, Bookmark, PlusCircle, CalendarDays, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOUR_KEY = "atlas_tour_completed";

const steps = [
  {
    icon: Globe,
    title: "Global Calendar",
    description: "Discover all campus events in one place. Filter by category, type, or date to find what interests you.",
    color: "bg-highlight text-highlight-foreground",
  },
  {
    icon: Bookmark,
    title: "Save Events",
    description: "Bookmark events you're interested in. They'll appear in your personal calendar with customizable reminders.",
    color: "bg-event-student text-primary-foreground",
  },
  {
    icon: PlusCircle,
    title: "Create Events",
    description: "Organize your own events — from private study groups to open campus-wide meetups with RSVP management.",
    color: "bg-event-club text-primary-foreground",
  },
  {
    icon: CalendarDays,
    title: "Personal Calendar",
    description: "Your personalized schedule with mandatory, saved, and private events — all in one unified view.",
    color: "bg-primary text-primary-foreground",
  },
];

export default function FeatureTour() {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      const timer = setTimeout(() => setVisible(true), 800);
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
  const Icon = step.icon;

  return (
    <>
      <div className="tour-overlay" onClick={dismiss} />
      <div className="fixed inset-x-4 bottom-24 z-[9999] mx-auto max-w-sm animate-slide-up">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-elevated">
          {/* Close */}
          <button
            onClick={dismiss}
            className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Step indicator */}
          <div className="mb-4 flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i <= current ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div key={current} className="animate-fade-in">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${step.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold font-display">{step.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={dismiss}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip tour
            </button>
            <Button onClick={next} size="sm" className="gap-1.5 rounded-xl px-4">
              {current < steps.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              ) : (
                "Get Started"
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
