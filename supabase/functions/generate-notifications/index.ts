import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date();
    const notifications: Array<{
      user_id: string;
      event_id: string;
      notification_type: string;
      title: string;
      body: string;
    }> = [];

    // 1. Generate reminders for upcoming events
    const reminderWindows = [
      { type: "reminder_15m", minutes: 15, label: "15 minutes" },
      { type: "reminder_1h", minutes: 60, label: "1 hour" },
      { type: "reminder_1d", minutes: 1440, label: "1 day" },
    ];

    for (const window of reminderWindows) {
      const targetTime = new Date(now.getTime() + window.minutes * 60 * 1000);
      const windowStart = new Date(targetTime.getTime() - 5 * 60 * 1000);
      const windowEnd = new Date(targetTime.getTime() + 5 * 60 * 1000);

      // Find events starting in this window
      const { data: events } = await supabase
        .from("events")
        .select("id, title, start_time, location")
        .gte("start_time", windowStart.toISOString())
        .lte("start_time", windowEnd.toISOString())
        .neq("event_type", "private");

      if (!events?.length) continue;

      for (const event of events) {
        // Find attendees who want this reminder
        const { data: attendees } = await supabase
          .from("event_attendees")
          .select("user_id, reminder_minutes")
          .eq("event_id", event.id);

        if (!attendees?.length) continue;

        // Get muted users for this event
        const { data: mutes } = await supabase
          .from("notification_mutes")
          .select("user_id")
          .eq("event_id", event.id);
        const mutedSet = new Set(mutes?.map((m: any) => m.user_id) ?? []);

        for (const att of attendees) {
          if (mutedSet.has(att.user_id)) continue;
          const reminderMins = att.reminder_minutes ?? [60];
          if (!reminderMins.includes(window.minutes)) continue;

          // Check if already sent
          const { data: existing } = await supabase
            .from("notifications")
            .select("id")
            .eq("user_id", att.user_id)
            .eq("event_id", event.id)
            .eq("notification_type", window.type)
            .limit(1);

          if (existing?.length) continue;

          notifications.push({
            user_id: att.user_id,
            event_id: event.id,
            notification_type: window.type,
            title: `${event.title} starts in ${window.label}`,
            body: event.location ? `📍 ${event.location}` : "Get ready!",
          });
        }
      }
    }

    // 2. New events matching user interests (created in last 10 min)
    const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const { data: newEvents } = await supabase
      .from("events")
      .select("id, title, category, sub_tags, event_type")
      .gte("created_at", tenMinAgo.toISOString())
      .neq("event_type", "private");

    if (newEvents?.length) {
      // Get all users with interest tags
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, interest_tags");

      if (profiles?.length) {
        for (const event of newEvents) {
          const eventTags = [
            ...(event.sub_tags ?? []),
            event.category,
          ].map((t: string) => t?.toLowerCase());

          for (const profile of profiles) {
            const userTags = (profile.interest_tags ?? []).map((t: string) =>
              t.toLowerCase()
            );
            const hasMatch = eventTags.some(
              (t: string) => t && userTags.includes(t)
            );
            if (!hasMatch) continue;

            // Check mute
            const { data: mute } = await supabase
              .from("notification_mutes")
              .select("id")
              .eq("user_id", profile.user_id)
              .eq("event_id", event.id)
              .limit(1);
            if (mute?.length) continue;

            // Check if already notified
            const { data: existing } = await supabase
              .from("notifications")
              .select("id")
              .eq("user_id", profile.user_id)
              .eq("event_id", event.id)
              .eq("notification_type", "new_event_match")
              .limit(1);
            if (existing?.length) continue;

            notifications.push({
              user_id: profile.user_id,
              event_id: event.id,
              notification_type: "new_event_match",
              title: `New event: ${event.title}`,
              body: "Matches your interests!",
            });
          }
        }
      }
    }

    // Batch insert
    if (notifications.length > 0) {
      const { error } = await supabase
        .from("notifications")
        .insert(notifications);
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        generated: notifications.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
