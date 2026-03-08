import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Check, User, Zap, Heart } from "lucide-react";

const activityOptions = [
  { value: "workshops", label: "Workshops", icon: "🛠️" },
  { value: "meetups", label: "Meetups", icon: "🤝" },
  { value: "speaker_sessions", label: "Speaker Sessions", icon: "🎤" },
  { value: "hackathons", label: "Hackathons", icon: "💻" },
  { value: "sports", label: "Sports", icon: "⚽" },
  { value: "cultural_events", label: "Cultural Events", icon: "🎭" },
  { value: "networking", label: "Networking", icon: "🌐" },
];

const interestCategories = [
  {
    name: "Academic",
    icon: "📚",
    tags: ["Consulting", "Finance", "Marketing", "Product", "Strategy", "Entrepreneurship"],
  },
  {
    name: "Sports",
    icon: "🏅",
    tags: ["Football", "Cricket", "Badminton", "Running", "Gym"],
  },
  {
    name: "Cultural",
    icon: "🎨",
    tags: ["Music", "Dance", "Movies", "Food", "Photography"],
  },
];

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [workExp, setWorkExp] = useState("");

  // Step 2
  const [activities, setActivities] = useState<string[]>([]);

  // Step 3
  const [interests, setInterests] = useState<string[]>([]);

  const toggleItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  const step1Valid = name.trim().length >= 2 && age && gender;
  const step2Valid = activities.length >= 1;
  const step3Valid = interests.length >= 1;

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: name.trim(),
          age: parseInt(age),
          gender,
          work_experience: workExp.trim() || null,
          activity_preferences: activities,
          interest_tags: interests,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      await refreshProfile();
      toast.success("Welcome to Atlas! 🌍");
      navigate("/", { replace: true });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Progress bar */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-2 px-4 py-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${
                s < step ? "bg-primary" : s === step ? "bg-primary" : "bg-border"
              }`}>
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: s < step ? "100%" : s === step ? "50%" : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col mx-auto w-full max-w-lg px-4 pb-8">
        {/* Step 1: Basic Profile */}
        {step === 1 && (
          <div className="animate-fade-in flex-1 space-y-6 py-4">
            <div>
              <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h1 className="mt-3 text-2xl font-bold">Let's set up your profile</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell us a bit about yourself
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Full Name <span className="text-destructive">*</span></Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  maxLength={100}
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Age <span className="text-destructive">*</span></Label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                    min={18}
                    max={65}
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Gender <span className="text-destructive">*</span></Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non_binary">Non-binary</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Work Experience</Label>
                <Input
                  value={workExp}
                  onChange={(e) => setWorkExp(e.target.value)}
                  placeholder="e.g. 3 years at McKinsey"
                  maxLength={200}
                  className="h-11"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Activity Preferences */}
        {step === 2 && (
          <div className="animate-fade-in flex-1 space-y-6 py-4">
            <div>
              <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h1 className="mt-3 text-2xl font-bold">What do you enjoy?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick the activities you're interested in
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {activityOptions.map((opt) => {
                const selected = activities.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setActivities(toggleItem(activities, opt.value))}
                    className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                      selected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <span className="text-xl">{opt.icon}</span>
                    <span className={`text-sm font-medium ${selected ? "text-foreground" : "text-muted-foreground"}`}>
                      {opt.label}
                    </span>
                    {selected && (
                      <Check className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {activities.length} selected · pick at least 1
            </p>
          </div>
        )}

        {/* Step 3: Interest Tags */}
        {step === 3 && (
          <div className="animate-fade-in flex-1 space-y-6 py-4">
            <div>
              <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <h1 className="mt-3 text-2xl font-bold">Pick your interests</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll personalize your event feed
              </p>
            </div>

            <div className="space-y-5">
              {interestCategories.map((cat) => (
                <div key={cat.name}>
                  <h3 className="mb-2.5 flex items-center gap-2 text-sm font-semibold">
                    <span>{cat.icon}</span>
                    {cat.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cat.tags.map((tag) => {
                      const selected = interests.includes(tag.toLowerCase());
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setInterests(toggleItem(interests, tag.toLowerCase()))}
                          className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
                            selected
                              ? "border-primary bg-primary text-primary-foreground shadow-sm"
                              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {interests.length} selected · pick at least 1
            </p>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="h-12 flex-1 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !step1Valid : !step2Valid}
              className="h-12 flex-1 gap-2"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFinish}
              disabled={!step3Valid || saving}
              className="h-12 flex-1 gap-2"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Get Started
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
