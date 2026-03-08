import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useGlobalEvents() {
  return useQuery({
    queryKey: ["events", "global"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .neq("event_type", "private")
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function usePersonalEvents() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["events", "personal", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get saved event IDs
      const { data: saved } = await supabase
        .from("saved_events")
        .select("event_id")
        .eq("user_id", user!.id);
      const savedIds = saved?.map((s) => s.event_id) ?? [];

      // Get mandatory events + saved events + private events by user
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .or(
          `is_mandatory.eq.true,created_by.eq.${user!.id},id.in.(${savedIds.length ? savedIds.join(",") : "00000000-0000-0000-0000-000000000000"})`
        )
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useSavedEventIds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["saved_events", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_events")
        .select("event_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return new Set(data.map((s) => s.event_id));
    },
  });
}

export function useToggleSave() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, saved }: { eventId: string; saved: boolean }) => {
      if (saved) {
        await supabase.from("saved_events").delete().eq("user_id", user!.id).eq("event_id", eventId);
      } else {
        await supabase.from("saved_events").insert({ user_id: user!.id, event_id: eventId });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved_events"] });
      qc.invalidateQueries({ queryKey: ["events", "personal"] });
    },
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (event: {
      title: string;
      description?: string;
      event_type: "admin" | "club" | "student" | "private";
      location?: string;
      start_time: string;
      end_time: string;
      is_mandatory?: boolean;
      is_open_invite?: boolean;
      club_name?: string;
      created_by: string;
    }) => {
      const { error } = await supabase.from("events").insert(event);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
