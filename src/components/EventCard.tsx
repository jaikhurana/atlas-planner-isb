import { MapPin, Clock, Bookmark, BookmarkCheck, Users } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
  academic: "bg-amber-100 text-amber-700 border-amber-200",
  sports: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cultural: "bg-violet-100 text-violet-700 border-violet-200",
  social: "bg-pink-100 text-pink-700 border-pink-200",
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

  const handleClick = () => {
    navigate(`/event/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="animate-fade-in cursor-pointer rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md active:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${typeStyles[event_type]}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[event_type]}`} />
              {typeLabels[event_type]}
            </span>
            {category && category !== "other" && (
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${categoryStyles[category] ?? categoryStyles.other}`}>
                {category}
              </span>
            )}
            {is_mandatory && event_type !== "mandatory" && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                Mandatory
              </span>
            )}
          </div>

          <h3 className="font-semibold leading-tight text-card-foreground">{title}</h3>

          {club_name && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {club_name}
            </p>
          )}

          {!compact && description && (
            <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{description}</p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {format(new Date(start_time), "EEE, MMM d · h:mm a")}
            </span>
            {location && (
              <span className="inline-flex items-center gap-1">
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
            className="mt-1 shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary"
          >
            {isSaved ? (
              <BookmarkCheck className="h-5 w-5 text-foreground" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
