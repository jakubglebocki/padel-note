"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import {
  Activity,
  ActivityType,
  ActivityStatus,
  ACTIVITY_TYPE_OPTIONS,
  getActivityTypeConfig,
  calculateDuration,
  detectCollisions,
  getInitialStatus,
  getStatusLabel,
  getStatusColor,
  getAutoStatus,
} from "@/lib/activity-types";
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface AddActivityModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (activity: Omit<Activity, "id">) => void;
  onDelete?: (activityId: string) => void;
  onCancel?: (activityId: string) => void;
  onComplete?: (activityId: string) => void;
  editActivity?: Activity | null;
  initialDate?: Date;
  initialTime?: string;
  allActivities: Activity[];
}

export function AddActivityModal({
  open,
  onClose,
  onSave,
  onDelete,
  onCancel,
  onComplete,
  editActivity,
  initialDate,
  initialTime,
  allActivities,
}: AddActivityModalProps) {
  const [activityType, setActivityType] = useState<ActivityType>("individual_training");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:30");
  const [allDay, setAllDay] = useState(false);
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(4);
  const [collisionWarning, setCollisionWarning] = useState<Activity[]>([]);
  const [activityStatus, setActivityStatus] = useState<ActivityStatus>("scheduled");

  // Initialize form with edit data or defaults
  useEffect(() => {
    if (editActivity) {
      // When editing an existing activity, set all fields from that activity
      setActivityType(editActivity.type);
      setTitle(editActivity.title || "");
      setDate(editActivity.date);
      setStartTime(editActivity.startTime);
      setEndTime(editActivity.endTime);
      setAllDay(editActivity.allDay);
      setNotes(editActivity.notes || "");
      setIsRecurring(editActivity.isRecurring);
      setRecurringWeeks(editActivity.recurringWeeklyCount || 4);
      setActivityStatus(editActivity.status);
    } else if (initialDate) {
      // When creating a new activity
      setDate(initialDate);
      if (initialTime) {
        setStartTime(initialTime);
        // Calculate default end time based on current activity type
        const config = getActivityTypeConfig(activityType);
        const [hour, minute] = initialTime.split(":").map(Number);
        const endMinutes = hour * 60 + minute + config.defaultDuration;
        const endHour = Math.floor(endMinutes / 60);
        const endMin = endMinutes % 60;
        setEndTime(`${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`);
      }
      // Set initial status based on activity type
      setActivityStatus(getInitialStatus(activityType));
    }
  }, [editActivity, initialDate, initialTime]);

  // Update end time and status when activity type changes (only for new activities)
  useEffect(() => {
    if (!editActivity && !allDay && startTime) {
      const config = getActivityTypeConfig(activityType);
      const [hour, minute] = startTime.split(":").map(Number);
      const endMinutes = hour * 60 + minute + config.defaultDuration;
      const endHour = Math.floor(endMinutes / 60);
      const endMin = endMinutes % 60;
      setEndTime(`${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`);
      // Update status based on new type
      setActivityStatus(getInitialStatus(activityType));
    }
  }, [activityType, startTime, allDay, editActivity]);

  // Check for collisions
  useEffect(() => {
    if (!allDay && startTime && endTime) {
      const tempActivity: Activity = {
        id: editActivity?.id || "temp",
        type: activityType,
        title,
        date,
        startTime,
        endTime,
        duration: calculateDuration(startTime, endTime),
        allDay,
        notes,
        status: activityStatus,
        isRecurring,
        recurringId: editActivity?.recurringId,
        recurringWeeklyCount: recurringWeeks,
      };

      const collisions = detectCollisions(tempActivity, allActivities);
      setCollisionWarning(collisions);
    } else {
      setCollisionWarning([]);
    }
  }, [activityType, date, startTime, endTime, allDay, allActivities, editActivity?.id, title, notes, activityStatus, isRecurring, recurringWeeks]);

  const handleSave = () => {
    const duration = allDay ? 0 : calculateDuration(startTime, endTime);

    const activity: Omit<Activity, "id"> = {
      type: activityType,
      title: title || undefined,
      date,
      startTime: allDay ? "00:00" : startTime,
      endTime: allDay ? "23:59" : endTime,
      duration,
      allDay,
      notes: notes || undefined,
      status: activityStatus,
      isRecurring,
      recurringId: editActivity?.recurringId,
      recurringWeeklyCount: isRecurring ? recurringWeeks : undefined,
    };

    onSave(activity);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setActivityType("individual_training");
    setTitle("");
    setStartTime("09:00");
    setEndTime("10:30");
    setAllDay(false);
    setNotes("");
    setIsRecurring(false);
    setRecurringWeeks(4);
    setCollisionWarning([]);
    setActivityStatus("scheduled");
    onClose();
  };

  const handleDelete = () => {
    if (editActivity && onDelete) {
      onDelete(editActivity.id);
      handleClose();
    }
  };

  const handleCancelActivity = () => {
    if (editActivity && onCancel) {
      onCancel(editActivity.id);
      handleClose();
    }
  };

  const handleCompleteActivity = () => {
    if (editActivity && onComplete) {
      onComplete(editActivity.id);
      handleClose();
    }
  };

  // Get the actual status (auto-updated based on time)
  const actualStatus = editActivity ? getAutoStatus(editActivity) : activityStatus;

  const config = getActivityTypeConfig(activityType);
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editActivity ? "Edytuj aktywność" : "Dodaj aktywność"}
          </DialogTitle>
          <DialogDescription>
            {format(date, "EEEE, d MMMM yyyy", { locale: pl })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Activity Type Selector */}
          <div>
            <Label>Typ aktywności</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {ACTIVITY_TYPE_OPTIONS.map((type) => {
                const TypeIcon = type.icon;
                const isSelected = activityType === type.id;
                
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setActivityType(type.id)}
                    className="flex items-center gap-2 p-3 rounded-lg border-2 transition-all hover:shadow-md"
                    style={{
                      borderColor: isSelected ? type.color : "transparent",
                      backgroundColor: isSelected ? type.bgColor : "transparent",
                    }}
                  >
                    <TypeIcon className="h-5 w-5" style={{ color: type.color }} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Title */}
          <div>
            <Label htmlFor="title">Tytuł (opcjonalny)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={config.label}
              className="mt-1"
            />
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={format(date, "yyyy-MM-dd")}
              onChange={(e) => setDate(new Date(e.target.value))}
              className="mt-1"
            />
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="allDay" className="cursor-pointer">Cały dzień</Label>
          </div>

          {/* Time Range */}
          {!allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Godzina rozpoczęcia</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endTime">Godzina zakończenia</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Duration Display */}
          {!allDay && (
            <div className="text-sm text-muted-foreground">
              Czas trwania: {calculateDuration(startTime, endTime)} min
            </div>
          )}

          {/* Status Info */}
          {config.requiresTrainerApproval && (
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-warning">
                    Wymaga akceptacji trenera
                  </p>
                  <p className="text-xs text-warning/80 mt-1">
                    {editActivity 
                      ? `Status: ${getStatusLabel(activityStatus)}`
                      : "Po zapisaniu aktywność będzie oczekiwać na akceptację trenera."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status Badge (edit mode) */}
          {editActivity && (
            <div className="flex items-center gap-2 p-3 bg-muted/30 border border-border rounded-lg">
              <Label>Status aktywności:</Label>
              <div className="flex items-center gap-2 px-3 py-1 rounded-md" style={{
                backgroundColor: getStatusColor(actualStatus) + "20",
                borderColor: getStatusColor(actualStatus) + "40",
                borderWidth: "1px",
              }}>
                <span className="text-sm font-medium" style={{ color: getStatusColor(actualStatus) }}>
                  {getStatusLabel(actualStatus)}
                </span>
              </div>
            </div>
          )}

          {/* Complete Activity Button for in_progress activities */}
          {editActivity && actualStatus === "in_progress" && (
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-success mb-2">
                    Trening zakończony
                  </h4>
                  <p className="text-xs text-success/80 mb-3">
                    Jeśli ukończyłeś ten trening, możesz go oznaczyć jako zrealizowany i dodać ocenę.
                  </p>
                  <Button
                    onClick={handleCompleteActivity}
                    className="bg-success hover:bg-success/90 text-white"
                  >
                    Zrealizuj i oceń
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Recurring */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="recurring" className="cursor-pointer">
                Powtarzaj co tydzień
              </Label>
            </div>

            {isRecurring && (
              <div className="ml-6">
                <Label htmlFor="recurringWeeks">Liczba tygodni</Label>
                <Input
                  id="recurringWeeks"
                  type="number"
                  min="2"
                  max="52"
                  value={recurringWeeks}
                  onChange={(e) => setRecurringWeeks(Number(e.target.value))}
                  className="mt-1 w-24"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notatki</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dodaj notatki..."
              className="mt-1 w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background"
            />
          </div>

          {/* Collision Warning */}
          {collisionWarning.length > 0 && (
            <Alert className="border-warning bg-warning/10">
              <AlertCircle className="h-4 w-4 text-warning" />
              <div className="ml-2">
                <p className="text-sm font-medium text-warning">
                  Ostrzeżenie: Nakładanie się aktywności
                </p>
                <p className="text-xs text-warning/80 mt-1">
                  Ta aktywność koliduje z {collisionWarning.length} innymi aktywnościami:
                </p>
                <ul className="text-xs text-warning/80 mt-1 ml-4 list-disc">
                  {collisionWarning.map((collision) => {
                    const collisionConfig = getActivityTypeConfig(collision.type);
                    return (
                      <li key={collision.id}>
                        {collision.title || collisionConfig.label} ({collision.startTime} - {collision.endTime})
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <div className="flex w-full gap-2">
            {/* Left side: Delete and Cancel buttons */}
            <div className="flex gap-2 mr-auto">
              {editActivity && actualStatus !== "cancelled" && actualStatus !== "completed" && onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelActivity}
                  className="border-warning text-warning hover:bg-warning/10"
                >
                  Anuluj aktywność
                </Button>
              )}
              {editActivity && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Usuń
                </Button>
              )}
            </div>
            
            {/* Right side: Close and Save buttons */}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Zamknij
              </Button>
              {actualStatus !== "cancelled" && actualStatus !== "completed" && (
                <Button type="button" onClick={handleSave} className="btn-primary">
                  {editActivity ? "Zapisz zmiany" : "Dodaj aktywność"}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

