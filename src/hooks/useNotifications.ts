import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Notification {
  id: string;
  user_id: string;
  event_id: string | null;
  notification_type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    refetchInterval: 30000, // poll every 30s
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Notification[];
    },
  });
}

export function useUnreadCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notifications_unread", user?.id],
    enabled: !!user,
    refetchInterval: 30000,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("is_read", false);
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications_unread"] });
    },
  });
}

export function useMarkAllRead() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user!.id)
        .eq("is_read", false);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications_unread"] });
    },
  });
}

export function useToggleMute() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, muted }: { eventId: string; muted: boolean }) => {
      if (muted) {
        await supabase
          .from("notification_mutes")
          .delete()
          .eq("user_id", user!.id)
          .eq("event_id", eventId);
      } else {
        await supabase
          .from("notification_mutes")
          .insert({ user_id: user!.id, event_id: eventId });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notification_mutes"] });
    },
  });
}

export function useIsMuted(eventId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notification_mutes", user?.id, eventId],
    enabled: !!user && !!eventId,
    queryFn: async () => {
      const { data } = await supabase
        .from("notification_mutes")
        .select("id")
        .eq("user_id", user!.id)
        .eq("event_id", eventId!)
        .limit(1);
      return (data?.length ?? 0) > 0;
    },
  });
}

export function useUpdateReminders() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, minutes }: { eventId: string; minutes: number[] }) => {
      await supabase
        .from("event_attendees")
        .update({ reminder_minutes: minutes })
        .eq("user_id", user!.id)
        .eq("event_id", eventId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event_attendees"] });
    },
  });
}
