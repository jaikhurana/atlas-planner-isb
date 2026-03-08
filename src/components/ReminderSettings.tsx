import { useAuth } from "@/contexts/AuthContext";
import { useIsMuted, useToggleMute, useUpdateReminders } from "@/hooks/useNotifications";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, BellOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";

const reminderOptions = [
  { value: 15, label: "15 min before" },
  { value: 60, label: "1 hour before" },
  { value: 1440, label: "1 day before" },
];

export default function ReminderSettings({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const { data: isMuted } = useIsMuted(eventId);
  const toggleMute = useToggleMute();
  const updateReminders = useUpdateReminders();

  // Get current reminder settings
  const { data: attendance } = useQuery({
    queryKey: ["event_attendees", user?.id, eventId],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("event_attendees")
        .select("reminder_minutes")
        .eq("user_id", user!.id)
        .eq("event_id", eventId)
        .single();
      return data;
    },
  });

  const currentReminders: number[] = attendance?.reminder_minutes ?? [60];

  const toggleReminder = (minutes: number) => {
    const next = currentReminders.includes(minutes)
      ? currentReminders.filter((m) => m !== minutes)
      : [...currentReminders, minutes];
    updateReminders.mutate({ eventId, minutes: next });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 w-full text-left hover:bg-secondary/50 transition-colors">
          <Bell className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">Reminders</p>
            <p className="text-xs text-muted-foreground">
              {isMuted
                ? "Muted"
                : currentReminders.length
                ? currentReminders
                    .sort((a, b) => a - b)
                    .map((m) => reminderOptions.find((o) => o.value === m)?.label ?? `${m}m`)
                    .join(", ")
                : "None set"}
            </p>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <div className="space-y-1">
          <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">
            Remind me
          </p>
          {reminderOptions.map((opt) => {
            const active = currentReminders.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggleReminder(opt.value)}
                disabled={!!isMuted}
                className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-sm transition-colors ${
                  active
                    ? "bg-primary/5 font-medium text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                } ${isMuted ? "opacity-50" : ""}`}
              >
                {opt.label}
                {active && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}

          <div className="my-1 border-t border-border" />

          <button
            onClick={() => toggleMute.mutate({ eventId, muted: !!isMuted })}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {isMuted ? (
              <>
                <Bell className="h-4 w-4" />
                Unmute notifications
              </>
            ) : (
              <>
                <BellOff className="h-4 w-4" />
                Mute this event
              </>
            )}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
