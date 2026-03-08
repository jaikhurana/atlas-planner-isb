import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedEventIds, useToggleSave } from "@/hooks/useEvents";
import { format, formatDistanceToNowStrict } from "date-fns";
import {
  ArrowLeft, MapPin, Clock, CalendarDays, Users,
  Bookmark, BookmarkCheck, Share2, Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReminderSettings from "@/components/ReminderSettings";

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

const accentBg: Record<string, string> = {
  mandatory: "from-event-admin/10 to-transparent",
  club: "from-event-club/10 to-transparent",
  open_invite: "from-event-student/10 to-transparent",
  private: "from-event-private/10 to-transparent",
};

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: savedIds } = useSavedEventIds();
  const toggleSave = useToggleSave();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: attendeeCount } = useQuery({
    queryKey: ["event_attendees_count", id],
    enabled: !!id,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("event_attendees")
        .select("*", { count: "exact", head: true })
        .eq("event_id", id!);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const isSaved = savedIds?.has(id ?? "");

  const handleToggleSave = () => {
    if (!id) return;
    toggleSave.mutate({ eventId: id, saved: isSaved ?? false });
  };

  const handleRSVP = async () => {
    if (!id || !user) return;
    try {
      // Upsert to attending
      const { error } = await supabase
        .from("event_attendees")
        .upsert(
          { user_id: user.id, event_id: id, status: "attending" },
          { onConflict: "event_id,user_id" }
        );
      if (error) throw error;
      toast.success("You're attending this event!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: event?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4">
        <p className="text-muted-foreground">Event not found</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const isPast = new Date(event.end_time) < new Date();
  const isUpcoming = new Date(event.start_time) > new Date();

  return (
    <div className="min-h-screen pb-safe">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-card/80 px-4 py-3 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} className="rounded-lg p-1.5 hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1">
          <button onClick={handleShare} className="rounded-lg p-2 hover:bg-secondary">
            <Share2 className="h-4.5 w-4.5" />
          </button>
          {event.event_type !== "private" && (
            <button onClick={handleToggleSave} className="rounded-lg p-2 hover:bg-secondary">
              {isSaved ? (
                <BookmarkCheck className="h-5 w-5" />
              ) : (
                <Bookmark className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      </header>

      {/* Hero gradient */}
      <div className={`bg-gradient-to-b ${accentBg[event.event_type]} px-4 pb-4 pt-5`}>
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeStyles[event.event_type]}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[event.event_type]}`} />
            {typeLabels[event.event_type]}
          </span>
          {event.category && event.category !== "other" && (
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${categoryStyles[event.category] ?? categoryStyles.other}`}>
              {event.category}
            </span>
          )}
          {event.is_mandatory && (
            <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
              Mandatory
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold font-display leading-tight">{event.title}</h1>
        {event.club_name && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {event.club_name}
          </p>
        )}
      </div>

      <main className="mx-auto max-w-lg space-y-5 px-4 py-5">
        {/* Details grid */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {format(new Date(event.start_time), "EEEE, MMMM d, yyyy")}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(event.start_time), "h:mm a")} – {format(new Date(event.end_time), "h:mm a")}
              </p>
              {isUpcoming && (
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Starts {formatDistanceToNowStrict(new Date(event.start_time), { addSuffix: true })}
                </p>
              )}
            </div>
          </div>

          {event.location && (
            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{event.location}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
            <Users className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{attendeeCount ?? 0} attending</p>
              {event.max_cap && !event.ignore_cap && (
                <p className="text-xs text-muted-foreground">
                  {event.max_cap - (attendeeCount ?? 0)} spots left
                </p>
              )}
            </div>
          </div>

          {/* Reminder Settings */}
          {isSaved && event.event_type !== "private" && isUpcoming && (
            <ReminderSettings eventId={event.id} />
          )}
        </div>

        {/* Tags */}
        {event.sub_tags && event.sub_tags.length > 0 && (
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
              <Tag className="h-3.5 w-3.5" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {event.sub_tags.map((tag: string) => (
                <span key={tag} className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">About</h3>
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}

        {/* RSVP Button */}
        {event.event_type !== "private" && !isPast && (
          <div className="sticky bottom-20 pt-2">
            <Button onClick={handleRSVP} className="w-full" size="lg">
              RSVP — I'm Attending
            </Button>
          </div>
        )}

        {isPast && (
          <div className="rounded-lg border border-dashed border-border py-6 text-center">
            <p className="text-sm text-muted-foreground">This event has ended</p>
          </div>
        )}
      </main>
    </div>
  );
}
