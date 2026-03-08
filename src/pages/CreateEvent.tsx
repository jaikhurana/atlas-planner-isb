import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateEvent } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function CreateEvent() {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const createEvent = useCreateEvent();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<string>("student");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isMandatory, setIsMandatory] = useState(false);
  const [isOpenInvite, setIsOpenInvite] = useState(true);
  const [clubName, setClubName] = useState("");

  const canCreateAdmin = roles.includes("admin");
  const canCreateClub = roles.includes("club") || roles.includes("admin");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await createEvent.mutateAsync({
        title,
        description: description || undefined,
        event_type: eventType as any,
        location: location || undefined,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        is_mandatory: isMandatory,
        is_open_invite: isOpenInvite,
        club_name: clubName || undefined,
        created_by: user.id,
      });
      toast.success("Event created!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="pb-safe">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-lg">
        <h1 className="text-lg font-bold">Create Event</h1>
      </header>

      <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-4 px-4 py-5">
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event name" required />
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this event about?" rows={3} />
        </div>

        <div className="space-y-1.5">
          <Label>Event Type</Label>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              {canCreateClub && <SelectItem value="club">Club</SelectItem>}
              {canCreateAdmin && <SelectItem value="admin">Admin</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        {eventType === "club" && (
          <div className="space-y-1.5">
            <Label>Club Name</Label>
            <Input value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder="e.g. Finance Club" />
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Location</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Where?" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Start</Label>
            <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>End</Label>
            <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </div>
        </div>

        {canCreateAdmin && (
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="mandatory" className="cursor-pointer">Mandatory for all students</Label>
            <Switch id="mandatory" checked={isMandatory} onCheckedChange={setIsMandatory} />
          </div>
        )}

        {eventType !== "private" && (
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="open" className="cursor-pointer">Open invite</Label>
            <Switch id="open" checked={isOpenInvite} onCheckedChange={setIsOpenInvite} />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={createEvent.isPending}>
          {createEvent.isPending ? "Creating..." : "Create Event"}
        </Button>
      </form>
    </div>
  );
}
