import { MapPin, Clock, Bookmark, BookmarkCheck, Users } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface EventCardProps {
  id: string;
  title: string;
  description?: string | null;
  event_type: "mandatory" | "club" | "open_invite" | "private";
  location?: string | null;
  start_time: string;
  end_time: string;
  is_mandatory?: boolean;
  club_name?: string | null;
  category?: string | null;
  created_by?: string;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  compact?: boolean;
}

const typeStyles: Record<string, string> = {
  mandatory: "bg-event-admin/10 text-event-admin border-event-admin/20",
  club: "bg-event-club/10 text-event-club border-event-club/20",
  open_invite: "bg-event-student/10 text-event-student border-event-student/20",
  private: "bg-event-private/10 text-event-private border-event-private/20",
};

const dotStyles: Record<string, string> = {
  mandatory: "bg-event-admin",
  club: "bg-event-club",
  open_invite: "bg-event-student",
  private: "bg-event-private",
};

const typeLabels: Record<string, string> = {
  mandatory: "Mandatory",
  club: "Club",
  open_invite: "Open Invite",
  private: "Private",
};

const categoryStyles: Record<string, string> = {
  academic: "bg-warm-yellow/15 text-foreground border-warm-yellow/25",
  sports: "bg-warm-teal/15 text-foreground border-warm-teal/25",
  cultural: "bg-warm-lavender/15 text-foreground border-warm-lavender/25",
  social: "bg-warm-coral/15 text-foreground border-warm-coral/25",
  other: "bg-secondary text-muted-foreground border-border",
};

export default function EventCard({
  id,
  title,
  description,
  event_type,
  location,
  start_time,
  is_mandatory,
  club_name,
  category,
  isSaved,
  onToggleSave,
  compact,
}: EventCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/event/${id}`)}
      className="group cursor-pointer rounded-2xl border border-border/50 bg-card p-4 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${typeStyles[event_type]}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[event_type]}`} />
              {typeLabels[event_type]}
            </span>
            {category && category !== "other" && (
              <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${categoryStyles[category] ?? categoryStyles.other}`}>
                {category}
              </span>
            )}
            {is_mandatory && event_type !== "mandatory" && (
              <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-[11px] font-bold text-destructive">
                Mandatory
              </span>
            )}
          </div>

          <h3 className="font-bold leading-snug text-card-foreground group-hover:text-primary transition-colors duration-200">
            {title}
          </h3>

          {club_name && (
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Users className="h-3 w-3" />
              {club_name}
            </p>
          )}

          {!compact && description && (
            <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{description}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {format(new Date(start_time), "EEE, MMM d · h:mm a")}
            </span>
            {location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {location}
              </span>
            )}
          </div>
        </div>

        {onToggleSave && event_type !== "private" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(id);
            }}
            className="mt-1 shrink-0 rounded-full p-2 text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:scale-110 active:scale-95"
          >
            {isSaved ? (
              <BookmarkCheck className="h-5 w-5 text-primary" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
