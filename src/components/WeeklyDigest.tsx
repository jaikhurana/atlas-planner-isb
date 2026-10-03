import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function weekStartStr() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

// Minimal markdown renderer for the digest (bold, headers, lists, line breaks)
function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} className="h-2" />;
    if (trimmed.startsWith("### ") || trimmed.startsWith("## ") || trimmed.startsWith("**🎯") || trimmed.startsWith("**📅")) {
      return (
        <p key={i} className="mt-2 text-sm font-extrabold text-foreground">
          {inlineBold(trimmed.replace(/^#+\s*/, ""))}
        </p>
      );
    }
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      return (
        <p key={i} className="ml-1 flex gap-2 text-sm leading-relaxed text-foreground/90">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
          <span>{inlineBold(trimmed.slice(2))}</span>
        </p>
      );
    }
    return (
      <p key={i} className="text-sm leading-relaxed text-foreground/90">
        {inlineBold(trimmed)}
      </p>
    );
  });
}

function inlineBold(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-bold text-foreground">{part}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function WeeklyDigest() {
  const { user } = useAuth();
  const [digest, setDigest] = useState<string | null>(null);
  const [noEvents, setNoEvents] = useState(false);

  // Load cached digest
  const { isLoading: cacheLoading } = useQuery({
    queryKey: ["weekly_digest", user?.id, weekStartStr()],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("weekly_digests")
        .select("content")
        .eq("user_id", user!.id)
        .eq("week_start", weekStartStr())
        .maybeSingle();
      if (data?.content) setDigest(data.content);
      return data;
    },
  });

  const generate = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("weekly-digest");
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      if (data?.digest) {
        setDigest(data.digest);
        setNoEvents(false);
      } else {
        setNoEvents(true);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Couldn't generate your digest. Try again.");
    },
  });

  return (
    <section className="animate-fade-in rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/8 via-card to-warm-yellow/8 p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Your Weekly Digest
          </h2>
        </div>
        {digest && (
          <button
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            title="Regenerate"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${generate.isPending ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>

      {cacheLoading ? (
        <div className="space-y-2">
          <div className="h-4 w-3/4 animate-pulse-soft rounded-lg bg-secondary" />
          <div className="h-4 w-full animate-pulse-soft rounded-lg bg-secondary" />
          <div className="h-4 w-1/2 animate-pulse-soft rounded-lg bg-secondary" />
        </div>
      ) : digest ? (
        <div className="space-y-0.5">{renderMarkdown(digest)}</div>
      ) : noEvents ? (
        <p className="text-sm text-muted-foreground">
          No events scheduled this week yet — check back soon! 📭
        </p>
      ) : (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted-foreground">
            Get an AI-powered summary of this week's events, picked for your interests ✨
          </p>
          <Button
            size="sm"
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
            className="gap-1.5 rounded-2xl text-xs font-bold shadow-soft"
          >
            {generate.isPending ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Generate my digest
              </>
            )}
          </Button>
        </div>
      )}
    </section>
  );
}
