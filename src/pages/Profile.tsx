import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, Shield, Mail, Briefcase, Sun, Moon, Monitor } from "lucide-react";

const roleLabels: Record<string, string> = {
  student: "Student",
  club: "Club",
  admin: "Admin",
};

export default function Profile() {
  const { profile, roles, signOut, user } = useAuth();
  const { theme, setTheme } = useTheme();

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
        <div className="animate-scale-up flex flex-col items-center rounded-3xl border border-border/50 bg-card p-7 shadow-card">
          <div className="mb-4 flex h-18 w-18 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-warm-coral/20">
            <User className="h-8 w-8 text-primary" />
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
          <div className="mt-3 flex gap-2">
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

        {/* Theme switcher */}
        <div className="animate-fade-in rounded-3xl border border-border/50 bg-card p-4 shadow-card">
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

        {/* Activity preferences */}
        {profile?.activity_preferences && profile.activity_preferences.length > 0 && (
          <div className="animate-fade-in rounded-3xl border border-border/50 bg-card p-4 shadow-card">
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
          <div className="animate-fade-in rounded-3xl border border-border/50 bg-card p-4 shadow-card">
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

        <Button variant="outline" className="w-full rounded-2xl font-bold" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </main>
    </div>
  );
}
