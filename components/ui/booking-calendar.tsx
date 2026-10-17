"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { addDays, format, isBefore, set } from "date-fns";
import { CalendarDays, Clock } from "lucide-react";
import { useState } from "react";

interface BookingCalendarProps {
  className?: string;
}

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export function BookingCalendar({ className }: BookingCalendarProps) {
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!date || !timeSlot) return;

    setIsSubmitting(true);
    try {
      // Ici, vous pouvez ajouter votre logique de réservation
      // Par exemple, envoyer les données à une API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Réinitialiser le formulaire
      setDate(undefined);
      setTimeSlot(undefined);

      // Afficher une confirmation
      alert("Meeting scheduled successfully!");
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      alert("Failed to schedule meeting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabledDays = {
    before: new Date(),
    after: addDays(new Date(), 30), // Limite à 30 jours dans le futur
  };

  const isTimeSlotAvailable = (slot: string) => {
    if (!date) return true;

    const [hours, minutes] = slot.split(":").map(Number);
    const slotTime = set(date, { hours, minutes });

    // Désactiver les créneaux passés pour aujourd'hui
    if (
      date.toDateString() === new Date().toDateString() &&
      isBefore(slotTime, new Date())
    ) {
      return false;
    }

    // Ici, vous pouvez ajouter d'autres vérifications de disponibilité
    return true;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "gap-2 text-primary hover:text-primary hover:bg-primary/10",
            className
          )}
        >
          <CalendarDays className="size-4" />
          Schedule a Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule a Meeting</DialogTitle>
          <DialogDescription>
            Pick a date and time that works best for you. I&apos;ll confirm the
            meeting within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={disabledDays}
            className="rounded-md border"
          />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Available time slots
              </span>
            </div>

            <Select value={timeSlot} onValueChange={setTimeSlot}>
              <SelectTrigger aria-label="Select a time">
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((slot) => (
                  <SelectItem
                    key={slot}
                    value={slot}
                    disabled={!isTimeSlotAvailable(slot)}
                  >
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {date && timeSlot && (
            <div className="text-sm text-muted-foreground">
              Selected: {format(date, "PPP")} at {timeSlot}
            </div>
          )}

          <Button
            className="w-full"
            disabled={!date || !timeSlot || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Scheduling..." : "Schedule Meeting"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
