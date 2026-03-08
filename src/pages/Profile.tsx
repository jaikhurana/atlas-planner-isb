import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, Shield } from "lucide-react";

const roleLabels: Record<string, string> = {
  student: "Student",
  club: "Club",
  admin: "Admin",
};

export default function Profile() {
  const { profile, roles, signOut, user } = useAuth();

  return (
    <div className="pb-safe">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-lg">
        <h1 className="text-lg font-bold">Profile</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-5">
        <div className="mb-6 flex flex-col items-center rounded-xl border border-border bg-card p-6">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">{profile?.full_name ?? "—"}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
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

        <Button variant="outline" className="w-full" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </main>
    </div>
  );
}
