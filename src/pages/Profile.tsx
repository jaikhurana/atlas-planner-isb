import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, Shield, Mail, Briefcase } from "lucide-react";

const roleLabels: Record<string, string> = {
  student: "Student",
  club: "Club",
  admin: "Admin",
};

export default function Profile() {
  const { profile, roles, signOut, user } = useAuth();

  return (
    <div className="pb-safe">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/80 px-4 py-3 backdrop-blur-xl">
        <h1 className="text-lg font-bold font-display">Profile</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-5 space-y-4">
        {/* Avatar card */}
        <div className="animate-scale-up flex flex-col items-center rounded-2xl border border-border/60 bg-card p-6 shadow-card">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-muted shadow-sm">
            <User className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold font-display">{profile?.full_name ?? "—"}</h2>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            {user?.email}
          </p>
          {profile?.work_experience && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Briefcase className="h-3 w-3" />
              {profile.work_experience}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            {roles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium"
              >
                <Shield className="h-3 w-3" />
                {roleLabels[role] ?? role}
              </span>
            ))}
          </div>
        </div>

        {/* Activity preferences */}
        {profile?.activity_preferences && profile.activity_preferences.length > 0 && (
          <div className="animate-fade-in rounded-2xl border border-border/60 bg-card p-4 shadow-card">
            <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Activity Preferences
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.activity_preferences.map((a) => (
                <span key={a} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize">
                  {a.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interest tags */}
        {profile?.interest_tags && profile.interest_tags.length > 0 && (
          <div className="animate-fade-in rounded-2xl border border-border/60 bg-card p-4 shadow-card">
            <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Interests
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.interest_tags.map((t) => (
                <span key={t} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        <Button variant="outline" className="w-full rounded-xl" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </main>
    </div>
  );
}
