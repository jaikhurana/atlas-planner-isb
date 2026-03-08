import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

const interestEmoji: Record<string, string> = {
  // Activity preferences
  workshops: "🛠️",
  meetups: "🤝",
  speaker_sessions: "🎤",
  hackathons: "💻",
  sports: "⚽",
  cultural_events: "🎭",
  networking: "🌐",
  // Academic interests
  consulting: "📊",
  finance: "💰",
  marketing: "📣",
  product: "🚀",
  strategy: "♟️",
  entrepreneurship: "💡",
  // Sports interests
  football: "⚽",
  cricket: "🏏",
  badminton: "🏸",
  running: "🏃",
  gym: "🏋️",
  // Cultural interests
  music: "🎵",
  dance: "💃",
  movies: "🎬",
  food: "🍕",
  photography: "📷",
};

export default function InterestCarousel() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const tags = [
    ...(profile?.interest_tags ?? []),
    ...(profile?.activity_preferences ?? []),
  ];

  // Deduplicate & lowercase
  const unique = [...new Set(tags.map((t) => t.toLowerCase()))];

  if (unique.length === 0) return null;

  const handleClick = (tag: string) => {
    navigate(`/global?interest=${encodeURIComponent(tag)}`);
  };

  return (
    <section className="animate-fade-in">
      <div className="mb-3 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Your Interests
        </h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {unique.map((tag) => (
          <button
            key={tag}
            onClick={() => handleClick(tag)}
            className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-border/60 bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-soft transition-all duration-200 hover:border-primary/30 hover:shadow-glow active:scale-95"
          >
            <span>{interestEmoji[tag] ?? "✨"}</span>
            <span className="capitalize">{tag}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
