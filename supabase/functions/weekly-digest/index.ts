import { createClient } from "npm:@supabase/supabase-js@2";
import { createOpenAI } from "npm:@ai-sdk/openai";
import { streamText } from "npm:ai";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
} from "../_shared/run-id.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
    });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return json({ error: "AI is not configured for this app yet." }, 500);
    }

    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Please sign in to get your digest." }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: "Please sign in to get your digest." }, 401);

    // Current week start (Monday)
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // Check cache (service role to bypass RLS for cache read/write)
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: cached } = await admin
      .from("weekly_digests")
      .select("content")
      .eq("user_id", user.id)
      .eq("week_start", weekStartStr)
      .maybeSingle();

    if (cached?.content) {
      return json({ digest: cached.content, cached: true });
    }

    // Fetch user interests
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, interest_tags, activity_preferences")
      .eq("user_id", user.id)
      .single();

    // Fetch this week's public events
    const { data: events } = await supabase
      .from("events")
      .select("title, description, location, start_time, end_time, category, sub_tags, club_name, event_type")
      .neq("event_type", "private")
      .gte("start_time", weekStart.toISOString())
      .lt("start_time", weekEnd.toISOString())
      .order("start_time", { ascending: true });

    if (!events || events.length === 0) {
      return json({ digest: null, message: "No events scheduled this week yet." });
    }

    const eventLines = events
      .map((e) => {
        const start = new Date(e.start_time);
        const when = start.toLocaleString("en-IN", {
          weekday: "short", month: "short", day: "numeric",
          hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata",
        });
        return `- ${e.title} (${e.category}${e.club_name ? `, by ${e.club_name}` : ""}) — ${when} at ${e.location ?? "TBA"}. Tags: ${(e.sub_tags ?? []).join(", ") || "none"}. ${e.description ? `About: ${e.description.slice(0, 200)}` : ""}`;
      })
      .join("\n");

    const interests = [
      ...(profile?.interest_tags ?? []),
      ...(profile?.activity_preferences ?? []),
    ];

    const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(req));
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: LOVABLE_API_KEY,
      headers: { "Lovable-API-Key": LOVABLE_API_KEY, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: runIdFetch.fetch,
    });

    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      abortSignal: req.signal,
      providerOptions: {
        openai: {
          store: false,
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          include: ["reasoning.encrypted_content"],
        },
      },
      messages: [
        {
          role: "system",
          content:
            "You write a friendly weekly event digest for an MBA student at ISB. Be warm, concise, and energetic. Use short markdown: a one-line intro, then sections like '🎯 Picked for you' (events matching their interests, 2-4 items with a one-line reason each), '📅 Also happening' (other notable events, brief), and a one-line closing tip. Keep it under 250 words total. Use the student's first name if known.",
        },
        {
          role: "user",
          content: `Student: ${profile?.full_name ?? "there"}\nTheir interests: ${interests.join(", ") || "not specified"}\n\nThis week's events:\n${eventLines}\n\nWrite the weekly digest.`,
        },
      ],
    });

    const digest = (await result.text).trim();

    if (!digest) {
      return json({ error: "The digest came back empty — please try again." }, 502);
    }

    // Cache the digest for this week
    await admin.from("weekly_digests").upsert(
      { user_id: user.id, week_start: weekStartStr, content: digest },
      { onConflict: "user_id,week_start" }
    );

    const headers: Record<string, string> = {};
    const runId = runIdFetch.getRunId();
    if (runId) headers["X-Lovable-AIG-Run-ID"] = runId;

    return json({ digest, cached: false }, 200, headers);
  } catch (err) {
    const status = (err as { status?: number })?.status;
    const message = err instanceof Error ? err.message : "Something went wrong";
    if (status === 402 || status === 403) {
      return json({ error: "AI usage is currently paused for this app. Please try again later." }, status);
    }
    return json({ error: message }, 500);
  }
});
