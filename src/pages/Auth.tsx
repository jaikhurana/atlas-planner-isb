import { useState } from "react";
import atlasLogo from "@/assets/atlas-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith("@isb.edu")) {
      toast.error("Only @isb.edu email addresses are allowed");
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-background">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-warm-yellow/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 h-48 w-48 rounded-full bg-warm-teal/6 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary shadow-glow">
            <span className="text-2xl">🌍</span>
          </div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-foreground">Atlas</h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">Your campus, connected ✨</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5 animate-fade-in">
              <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-12 rounded-2xl border-border/60 bg-card text-base shadow-soft"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@isb.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-2xl border-border/60 bg-card text-base shadow-soft"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 rounded-2xl border-border/60 bg-card text-base shadow-soft"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-12 rounded-2xl text-base font-bold shadow-glow"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                <span>Hold on...</span>
              </div>
            ) : isSignUp ? "Create Account" : "Sign In"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-bold text-primary underline-offset-4 hover:underline"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}
