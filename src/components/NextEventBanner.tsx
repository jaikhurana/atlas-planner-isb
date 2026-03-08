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
  mandatory: "from-event-admin/12 via-event-admin/6 to-transparent border-event-admin/15",
  club: "from-event-club/12 via-event-club/6 to-transparent border-event-club/15",
  open_invite: "from-event-student/12 via-event-student/6 to-transparent border-event-student/15",
  private: "from-event-private/12 via-event-private/6 to-transparent border-event-private/15",
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
      className={`animate-scale-up rounded-2xl border bg-gradient-to-br p-5 shadow-card ${bgMap[event_type]}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Next Up
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${accentMap[event_type]}`}>
          {startsIn}
        </span>
      </div>
      <h3 className="text-xl font-bold font-display leading-tight text-foreground">{title}</h3>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
      <Button
        size="sm"
        variant="secondary"
        className="mt-4 gap-1.5 rounded-xl text-xs font-semibold"
      >
        View Details
        <ArrowRight className="h-3 w-3" />
      </Button>
    </div>
  );
}
