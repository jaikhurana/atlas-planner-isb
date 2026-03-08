import { format, formatDistanceToNowStrict } from "date-fns";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NextEventBannerProps {
  title: string;
  start_time: string;
  end_time: string;
  location?: string | null;
  event_type: "mandatory" | "club" | "open_invite" | "private";
}

const bgMap: Record<string, string> = {
  mandatory: "from-event-admin/15 to-event-admin/5 border-event-admin/20",
  club: "from-event-club/15 to-event-club/5 border-event-club/20",
  open_invite: "from-event-student/15 to-event-student/5 border-event-student/20",
  private: "from-event-private/15 to-event-private/5 border-event-private/20",
};

const accentMap: Record<string, string> = {
  mandatory: "bg-event-admin text-primary-foreground",
  club: "bg-event-club text-primary-foreground",
  open_invite: "bg-event-student text-primary-foreground",
  private: "bg-event-private text-primary-foreground",
};

export default function NextEventBanner({
  title,
  start_time,
  end_time,
  location,
  event_type,
}: NextEventBannerProps) {
  const startsIn = formatDistanceToNowStrict(new Date(start_time), { addSuffix: true });

  return (
    <div
      className={`animate-fade-in rounded-xl border bg-gradient-to-br p-4 ${bgMap[event_type]}`}
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Next Up
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${accentMap[event_type]}`}>
          {startsIn}
        </span>
      </div>
      <h3 className="text-lg font-bold leading-tight text-foreground">{title}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
      <Button
        size="sm"
        variant="secondary"
        className="mt-3 gap-1 text-xs"
      >
        View Details
        <ArrowRight className="h-3 w-3" />
      </Button>
    </div>
  );
}
