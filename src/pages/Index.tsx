import { useAuth } from "@/contexts/AuthContext";
import { useGlobalEvents, useSavedEventIds, useToggleSave } from "@/hooks/useEvents";
import EventCard from "@/components/EventCard";
import { Globe } from "lucide-react";

export default function Index() {
  const { profile } = useAuth();
  const { data: events, isLoading } = useGlobalEvents();
  const { data: savedIds } = useSavedEventIds();
  const toggleSave = useToggleSave();

  const upcoming = events?.filter((e) => new Date(e.start_time) >= new Date()).slice(0, 5);

  const handleToggleSave = (id: string) => {
    toggleSave.mutate({ eventId: id, saved: savedIds?.has(id) ?? false });
  };

  return (
    <div className="pb-safe">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Globe className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Atlas</h1>
            <p className="text-xs text-muted-foreground">
              Hey, {profile?.full_name?.split(" ")[0] ?? "there"} 👋
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-5">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Upcoming Events
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-lg bg-secondary" />
              ))}
            </div>
          ) : upcoming?.length ? (
            <div className="space-y-3">
              {upcoming.map((event) => (
                <EventCard
                  key={event.id}
                  {...event}
                  isSaved={savedIds?.has(event.id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border py-12 text-center">
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
