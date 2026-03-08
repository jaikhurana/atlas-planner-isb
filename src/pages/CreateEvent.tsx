import { useState, useRef, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateEvent } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  CalendarDays, MapPin, Clock, Eye, EyeOff, Users,
  X, Plus, Check, Tag, Sparkles,
} from "lucide-react";

const categories = [
  { value: "academic", label: "Academic", icon: "📚" },
  { value: "sports", label: "Sports", icon: "⚽" },
  { value: "cultural", label: "Cultural", icon: "🎭" },
] as const;

const suggestedTags: Record<string, string[]> = {
  academic: ["Workshop", "Guest Lecture", "Case Study", "Panel Discussion", "Career Talk", "Networking"],
  sports: ["Cricket", "Football", "Basketball", "Badminton", "Tennis", "Yoga", "Marathon"],
  cultural: ["Music", "Dance", "Art", "Drama", "Film Screening", "Photography", "Poetry"],
};

export default function CreateEvent() {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const createEvent = useCreateEvent();
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [subTags, setSubTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [visibility, setVisibility] = useState<"open_invite" | "private">("open_invite");
  const [maxCap, setMaxCap] = useState("");
  const [ignoreCap, setIgnoreCap] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [clubName, setClubName] = useState("");
  const [isMandatory, setIsMandatory] = useState(false);

  // Derived
  const canCreateAdmin = roles.includes("admin");
  const canCreateClub = roles.includes("club") || roles.includes("admin");
  const isOpen = visibility === "open_invite";

  // Tag helpers
  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !subTags.includes(trimmed) && subTags.length < 10) {
      setSubTags([...subTags, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setSubTags(subTags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === "Backspace" && !tagInput && subTags.length) {
      setSubTags(subTags.slice(0, -1));
    }
  };

  const currentSuggestions = category
    ? (suggestedTags[category] ?? []).filter((t) => !subTags.includes(t))
    : [];

  // Validation
  const isValid =
    title.trim().length >= 2 &&
    category &&
    subTags.length >= 1 &&
    date &&
    startTime &&
    endTime &&
    location.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isValid) return;

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (endDateTime <= startDateTime) {
      toast.error("End time must be after start time");
      return;
    }

    // Determine event_type based on role + visibility
    let eventType: "mandatory" | "club" | "open_invite" | "private" = visibility;
    if (canCreateAdmin && isMandatory) eventType = "mandatory";
    else if (canCreateClub && clubName) eventType = "club";

    try {
      await createEvent.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        event_type: eventType,
        category: category as any,
        sub_tags: subTags.length ? subTags : undefined,
        location: location.trim(),
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        is_mandatory: isMandatory,
        is_open_invite: isOpen,
        club_name: clubName.trim() || undefined,
        max_cap: maxCap ? parseInt(maxCap) : undefined,
        ignore_cap: ignoreCap,
        created_by: user.id,
      });
      toast.success("Event created successfully! 🎉");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="pb-safe">
       <header className="sticky top-0 z-40 border-b border-border/40 bg-card/80 px-4 py-3 backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-extrabold font-display">Create Event</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-muted-foreground"
          >
            Cancel
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="mx-auto max-w-lg px-4 py-5">
        <div className="space-y-6">
          {/* Title & Description */}
          <section className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Event Title <span className="text-destructive">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Annual Business Case Competition"
                maxLength={120}
                required
                className="h-11"
              />
              <p className="text-[11px] text-muted-foreground text-right">
                {title.length}/120
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell people what to expect..."
                rows={4}
                maxLength={2000}
              />
              {description.length > 0 && (
                <p className="text-[11px] text-muted-foreground text-right">
                  {description.length}/2000
                </p>
              )}
            </div>
          </section>

          {/* Category */}
          <section className="space-y-3">
            <Label className="text-sm font-medium">
              Category <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    setCategory(c.value);
                    setSubTags([]);
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm font-medium transition-all ${
                    category === c.value
                      ? "border-primary bg-primary/5 text-foreground shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <span className="text-xl">{c.icon}</span>
                  <span className="text-xs">{c.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Subcategory Tags */}
          <section className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              Tags
            </Label>

            {/* Selected tags */}
            <div className="flex flex-wrap gap-1.5">
              {subTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </span>
              ))}
              <div className="relative flex-1 min-w-[120px]">
                <Input
                  ref={tagInputRef}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={subTags.length ? "Add more..." : "Type and press Enter"}
                  className="h-8 border-none bg-transparent px-1 text-xs shadow-none focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Suggested tags */}
            {currentSuggestions.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                  Suggested
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {currentSuggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Date & Time */}
          <section className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Date & Time <span className="text-destructive">*</span>
            </Label>
            <div className="space-y-3">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="h-11"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Start Time</label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">End Time</label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="space-y-1.5">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Location <span className="text-destructive">*</span>
            </Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. LRC Auditorium, ISB Hyderabad"
              required
              className="h-11"
              maxLength={200}
            />
          </section>

          {/* Visibility Toggle */}
          <section className="space-y-3">
            <Label className="text-sm font-medium">Visibility</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVisibility("private")}
                className={`flex items-center gap-2 rounded-xl border p-3.5 transition-all ${
                  !isOpen
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <EyeOff className={`h-4.5 w-4.5 ${!isOpen ? "text-foreground" : "text-muted-foreground"}`} />
                <div className="text-left">
                  <p className={`text-sm font-medium ${!isOpen ? "text-foreground" : "text-muted-foreground"}`}>
                    Private
                  </p>
                  <p className="text-[11px] text-muted-foreground">Only you</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setVisibility("open_invite")}
                className={`flex items-center gap-2 rounded-xl border p-3.5 transition-all ${
                  isOpen
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <Eye className={`h-4.5 w-4.5 ${isOpen ? "text-foreground" : "text-muted-foreground"}`} />
                <div className="text-left">
                  <p className={`text-sm font-medium ${isOpen ? "text-foreground" : "text-muted-foreground"}`}>
                    Open Invite
                  </p>
                  <p className="text-[11px] text-muted-foreground">Everyone</p>
                </div>
              </button>
            </div>
          </section>

          {/* Open Invite Options */}
          {isOpen && (
            <section className="animate-fade-in space-y-3 rounded-xl border border-border bg-card p-4">
              <h4 className="flex items-center gap-1.5 text-sm font-medium">
                <Users className="h-4 w-4 text-muted-foreground" />
                Attendance Settings
              </h4>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Max Attendees</label>
                <Input
                  type="number"
                  value={maxCap}
                  onChange={(e) => setMaxCap(e.target.value)}
                  placeholder="Unlimited"
                  min={1}
                  className="h-10"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">Ignore cap</p>
                  <p className="text-[11px] text-muted-foreground">Allow overflow beyond max</p>
                </div>
                <Switch checked={ignoreCap} onCheckedChange={setIgnoreCap} />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">Require approval</p>
                  <p className="text-[11px] text-muted-foreground">Review attendees before confirming</p>
                </div>
                <Switch checked={requiresApproval} onCheckedChange={setRequiresApproval} />
              </div>
            </section>
          )}

          {/* Club / Admin options */}
          {canCreateClub && (
            <section className="space-y-3 rounded-xl border border-border bg-card p-4">
              <h4 className="text-sm font-medium text-muted-foreground">Organizer</h4>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Club Name</label>
                <Input
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  placeholder="e.g. Finance Club"
                  maxLength={100}
                  className="h-10"
                />
              </div>
              {canCreateAdmin && (
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">Mandatory</p>
                    <p className="text-[11px] text-muted-foreground">Required for all students</p>
                  </div>
                  <Switch checked={isMandatory} onCheckedChange={setIsMandatory} />
                </div>
              )}
            </section>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold gap-2"
            disabled={createEvent.isPending || !isValid}
          >
            {createEvent.isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <Check className="h-4.5 w-4.5" />
                Create Event
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
