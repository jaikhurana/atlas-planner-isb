import { MapPin, Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { format } from "date-fns";

interface EventCardProps {
  id: string;
  title: string;
  description?: string | null;
  event_type: "admin" | "club" | "student" | "private";
  location?: string | null;
  start_time: string;
  end_time: string;
  is_mandatory?: boolean;
  club_name?: string | null;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

const typeStyles: Record<string, string> = {
  admin: "bg-event-admin/10 text-event-admin border-event-admin/20",
  club: "bg-event-club/10 text-event-club border-event-club/20",
  student: "bg-event-student/10 text-event-student border-event-student/20",
  private: "bg-event-private/10 text-event-private border-event-private/20",
};

const dotStyles: Record<string, string> = {
  admin: "bg-event-admin",
  club: "bg-event-club",
  student: "bg-event-student",
  private: "bg-event-private",
};

const typeLabels: Record<string, string> = {
  admin: "Admin",
  club: "Club",
  student: "Student",
  private: "Private",
};

export default function EventCard({
  id,
  title,
  description,
  event_type,
  location,
  start_time,
  end_time,
  is_mandatory,
  club_name,
  isSaved,
  onToggleSave,
}: EventCardProps) {
  return (
    <div className="animate-fade-in rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeStyles[event_type]}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[event_type]}`} />
              {typeLabels[event_type]}
            </span>
            {is_mandatory && (
              <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                Mandatory
              </span>
            )}
            {club_name && (
              <span className="text-xs text-muted-foreground">{club_name}</span>
            )}
          </div>
          <h3 className="font-semibold leading-tight text-card-foreground">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {format(new Date(start_time), "MMM d, h:mm a")}
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
            onClick={() => onToggleSave(id)}
            className="mt-1 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary"
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
