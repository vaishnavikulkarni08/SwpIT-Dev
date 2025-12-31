import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ScheduleMeetupProps {
  tradeId: string;
  onScheduled: () => void;
}

const ScheduleMeetup = ({ tradeId, onScheduled }: ScheduleMeetupProps) => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSchedule = async () => {
    if (!date || !time || !location) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Combine date and time
      const [hours, minutes] = time.split(':');
      const scheduledDateTime = new Date(date);
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

      // Update trade with scheduling info
      const { error } = await supabase
        .from("trades")
        .update({
          scheduled_at: scheduledDateTime.toISOString(),
          meetup_location: location,
          status: "scheduled",
        })
        .eq("id", tradeId);

      if (error) throw error;

      toast({
        title: "Meetup scheduled!",
        description: "Both parties have been notified.",
      });

      onScheduled();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const suggestedLocations = [
    "School Playground",
    "Nearby Park",
    "Shopping Mall",
    "Community Center",
    "Library",
    "Sports Complex",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Schedule Meetup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${
                  !date && "text-muted-foreground"
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Select Time</Label>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="Select time"
          />
        </div>

        <div className="space-y-2">
          <Label>Meetup Location</Label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a safe location" />
            </SelectTrigger>
            <SelectContent>
              {suggestedLocations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {loc}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleSchedule}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Scheduling..." : "Schedule Meetup"}
        </Button>

        <div className="text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Meetups should be scheduled during daylight hours
          </p>
          <p className="flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4" />
            Choose public, safe locations near school or home
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleMeetup;