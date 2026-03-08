import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { usePersonalEvents } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import {
  LogOut, User, Shield, Mail, Briefcase, Sun, Moon, Monitor,
  CalendarDays, Flame, Star, TrendingUp, Heart, Settings, BarChart3,
} from "lucide-react";
import { format, isThisMonth, isThisWeek, isPast } from "date-fns";

const roleLabels: Record<string, string> = {
  student: "Student",
  club: "Club",
  admin: "Admin",
};

type Tab = "recap" | "settings";

export default function Profile() {
  const { profile, roles, signOut, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { data: personalEvents } = usePersonalEvents();
  const [tab, setTab] = useState<Tab>("recap");

  const now = new Date();
  const pastEvents = personalEvents?.filter((e) => isPast(new Date(e.end_time))) ?? [];
  const thisWeekEvents = personalEvents?.filter((e) => isThisWeek(new Date(e.start_time), { weekStartsOn: 1 })) ?? [];
  const thisMonthEvents = personalEvents?.filter((e) => isThisMonth(new Date(e.start_time))) ?? [];
  const upcomingEvents = personalEvents?.filter((e) => new Date(e.start_time) >= now) ?? [];

  // Category breakdown
  const categoryCount: Record<string, number> = {};
  pastEvents.forEach((e) => {
    const cat = e.category ?? "other";
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];

  // Streak: consecutive weeks with at least one event (simplified)
  const streak = thisWeekEvents.length > 0 ? Math.max(1, Math.min(pastEvents.length, 12)) : 0;

  const themeOptions = [
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
    { value: "system" as const, icon: Monitor, label: "Auto" },
  ];

  return (
    <div className="pb-safe">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-card/80 px-4 py-3 backdrop-blur-2xl">
        <h1 className="text-lg font-extrabold font-display">Profile</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-5 space-y-4">
        {/* Avatar card */}
        <div className="animate-scale-up flex flex-col items-center rounded-3xl border border-border/50 bg-card p-6 shadow-card">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-warm-coral/20">
            <User className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-xl font-extrabold font-display">{profile?.full_name ?? "—"}</h2>
          <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            {user?.email}
          </p>
          {profile?.work_experience && (
            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Briefcase className="h-3 w-3" />
              {profile.work_experience}
            </p>
          )}
          <div className="mt-2 flex gap-2">
            {roles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary"
              >
                <Shield className="h-3 w-3" />
                {roleLabels[role] ?? role}
              </span>
            ))}
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-2xl border border-border/50 bg-card p-1 shadow-card">
          <button
            onClick={() => setTab("recap")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all duration-300 ${
              tab === "recap"
                ? "bg-primary text-primary-foreground shadow-glow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Recap
          </button>
          <button
            onClick={() => setTab("settings")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all duration-300 ${
              tab === "settings"
                ? "bg-primary text-primary-foreground shadow-glow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </button>
        </div>

        {tab === "recap" ? (
          <div className="space-y-4 animate-fade-in">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={CalendarDays}
                label="Events Attended"
                value={pastEvents.length}
                color="text-primary"
                bgColor="bg-primary/10"
              />
              <StatCard
                icon={TrendingUp}
                label="This Month"
                value={thisMonthEvents.length}
                color="text-warm-coral"
                bgColor="bg-warm-coral/10"
              />
              <StatCard
                icon={Flame}
                label="Week Streak"
                value={streak}
                suffix="wks"
                color="text-warm-yellow"
                bgColor="bg-warm-yellow/10"
              />
              <StatCard
                icon={Star}
                label="Upcoming"
                value={upcomingEvents.length}
                color="text-primary"
                bgColor="bg-primary/10"
              />
            </div>

            {/* Top category */}
            {topCategory && (
              <div className="rounded-3xl border border-border/50 bg-card p-4 shadow-card">
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Top Interest
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-warm-coral/10">
                    <Heart className="h-5 w-5 text-warm-coral" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold capitalize">{topCategory[0]}</p>
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {topCategory[1]} event{topCategory[1] !== 1 ? "s" : ""} attended
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Activity preferences */}
            {profile?.activity_preferences && profile.activity_preferences.length > 0 && (
              <div className="rounded-3xl border border-border/50 bg-card p-4 shadow-card">
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Activity Preferences
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.activity_preferences.map((a) => (
                    <span key={a} className="rounded-full bg-primary/8 px-3 py-1 text-xs font-bold text-primary capitalize">
                      {a.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interest tags */}
            {profile?.interest_tags && profile.interest_tags.length > 0 && (
              <div className="rounded-3xl border border-border/50 bg-card p-4 shadow-card">
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Interests
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.interest_tags.map((t) => (
                    <span key={t} className="rounded-full bg-warm-yellow/15 px-3 py-1 text-xs font-bold text-foreground capitalize">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* Theme switcher */}
            <div className="rounded-3xl border border-border/50 bg-card p-4 shadow-card">
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Appearance
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((opt) => {
                  const active = theme === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-all duration-300 ${
                        active
                          ? "border-primary bg-primary/10 text-primary shadow-soft"
                          : "border-border/50 bg-card text-muted-foreground hover:border-primary/30 hover:bg-secondary/50"
                      }`}
                    >
                      <opt.icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
                      <span className="text-xs font-bold">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account info */}
            <div className="rounded-3xl border border-border/50 bg-card p-4 shadow-card">
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Account
              </h3>
              <div className="space-y-3">
                <InfoRow label="Email" value={user?.email ?? "—"} />
                <InfoRow label="Name" value={profile?.full_name ?? "—"} />
                {profile?.gender && <InfoRow label="Gender" value={profile.gender} />}
                {profile?.age && <InfoRow label="Age" value={String(profile.age)} />}
                {profile?.work_experience && <InfoRow label="Experience" value={profile.work_experience} />}
                {profile?.club_name && <InfoRow label="Club" value={profile.club_name} />}
              </div>
            </div>

            <Button variant="outline" className="w-full rounded-2xl font-bold" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  color,
  bgColor,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="rounded-3xl border border-border/50 bg-card p-4 shadow-card">
      <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-2xl ${bgColor}`}>
        <Icon className={`h-4.5 w-4.5 ${color}`} />
      </div>
      <p className="text-2xl font-extrabold font-display">
        {value}
        {suffix && <span className="ml-0.5 text-sm font-bold text-muted-foreground">{suffix}</span>}
      </p>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-xs font-bold text-foreground capitalize">{value}</span>
    </div>
  );
}
