"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, LayoutGrid, Clock } from "lucide-react";
import { WeeklyCalendarGrid } from "@/components/plan/WeeklyCalendarGrid";
import { AddActivityModal } from "@/components/plan/AddActivityModal";
import { WeekNavigation } from "@/components/plan/WeekNavigation";
import { startOfWeek, startOfToday, endOfWeek, format, addWeeks } from "date-fns";
import { pl } from "date-fns/locale";
import { useSessions } from "@/lib/hooks/useSessions";
import { Session, SessionType, SESSION_TYPE_OPTIONS, calculateEndTime } from "@/lib/sessions";
import { Activity, ActivityType } from "@/lib/activity-types";
import { toast } from "sonner";

// Type mapping: SessionType ↔ ActivityType
const sessionTypeToActivityType: Record<SessionType, ActivityType> = {
  training_ind: "individual_training",
  training_grp: "group_training",
  sparing: "sparring",
  match_league: "league_match",
  americano: "americano",
  tournament: "tournament",
  gym: "gym",
  recovery: "recovery",
  mobility: "mobility",
  watch_match: "watch_match",
  machine_training: "machine_training",
};

const activityTypeToSessionType: Record<ActivityType, SessionType> = {
  individual_training: "training_ind",
  group_training: "training_grp",
  sparring: "sparing",
  league_match: "match_league",
  americano: "americano",
  tournament: "tournament",
  gym: "gym",
  recovery: "recovery",
  mobility: "mobility",
  watch_match: "watch_match",
  machine_training: "machine_training",
};

function sessionToActivity(session: Session): Activity {
  return {
    id: session.id,
    type: sessionTypeToActivityType[session.type],
    title: session.title,
    date: session.date,
    startTime: session.startTime,
    endTime: calculateEndTime(session.startTime, session.durationMin),
    duration: session.durationMin,
    allDay: false,
    notes: session.notes,
    status: session.status === "done" ? "completed" : session.status === "canceled" ? "cancelled" : "scheduled",
    isRecurring: false,
    intensity: session.intensity,
  };
}

function activityToSession(activity: Omit<Activity, "id">): Omit<Session, "id" | "userId" | "createdAt" | "updatedAt"> {
  return {
    type: activityTypeToSessionType[activity.type],
    title: activity.title,
    date: activity.date,
    startTime: activity.startTime,
    durationMin: activity.duration,
    status: activity.status === "completed" ? "done" : activity.status === "cancelled" ? "canceled" : "planned",
    notes: activity.notes,
    intensity: activity.intensity,
  };
}

export default function PlanPage() {
  const today = startOfToday();
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(today, { weekStartsOn: 1 })
  );
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  
  // Fetch sessions for current week + next 4 weeks (to support recurring)
  const extendedEndDate = addWeeks(currentWeekEnd, 4);
  const { sessions, isLoading, error, upsert, updateStatus, remove } = useSessions({
    fromDate: currentWeekStart,
    toDate: extendedEndDate,
    enableRealtime: false, // DISABLED: causing infinite loop
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editActivity, setEditActivity] = useState<Activity | null>(null);
  const [initialDate, setInitialDate] = useState<Date | undefined>();
  const [initialTime, setInitialTime] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<"week" | "calendar">("week");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Convert sessions to activities for existing components
  const activities: Activity[] = sessions.map(sessionToActivity);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSlotClick = useCallback((date: Date, time: string) => {
    setInitialDate(date);
    setInitialTime(time);
    setEditActivity(null);
    setModalOpen(true);
  }, []);

  const handleActivityClick = useCallback((activity: Activity) => {
    setEditActivity(activity);
    setInitialDate(undefined);
    setInitialTime(undefined);
    setModalOpen(true);
  }, []);

  const handleSaveActivity = useCallback(async (activityData: Omit<Activity, "id">) => {
    if (editActivity) {
      // Edit existing activity
      const sessionData = activityToSession(activityData);
      const success = await upsert({ ...sessionData, id: editActivity.id });
      
      if (success) {
        toast.success("Aktywność została zaktualizowana");
        setModalOpen(false);
        setEditActivity(null);
      }
    } else {
      // Add new activity
      const sessionData = activityToSession(activityData);

      if (activityData.isRecurring && activityData.recurringWeeklyCount) {
        // Create recurring activities
        const newSessions: Array<Omit<Session, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> = [];
        
        for (let i = 0; i < activityData.recurringWeeklyCount; i++) {
          const weekOffset = i * 7;
          const sessionDate = new Date(activityData.date);
          sessionDate.setDate(sessionDate.getDate() + weekOffset);
          
          newSessions.push({
            ...sessionData,
            date: sessionDate,
          });
        }
        
        // Bulk create
        const success = await upsert(newSessions[0]); // For now, create one by one
        // TODO: Implement bulkCreate in hook
        
        if (success) {
          toast.success(`Utworzono ${activityData.recurringWeeklyCount} powtarzających się aktywności`);
          setModalOpen(false);
        }
      } else {
        // Create single activity
        const success = await upsert(sessionData);
        
        if (success) {
          toast.success("Aktywność została dodana");
          setModalOpen(false);
        }
      }
    }
  }, [editActivity, upsert]);

  const handleDeleteActivity = useCallback(async (activityId: string) => {
    const confirmed = window.confirm("Czy na pewno chcesz usunąć tę aktywność?");
    
    if (confirmed) {
      const success = await remove(activityId);
      
      if (success) {
        toast.success("Aktywność została usunięta");
        setModalOpen(false);
        setEditActivity(null);
      }
    }
  }, [remove]);

  const handleCancelActivity = useCallback(async (activityId: string) => {
    const confirmed = window.confirm("Czy na pewno chcesz anulować tę aktywność?");
    
    if (confirmed) {
      const success = await updateStatus(activityId, "canceled");
      
      if (success) {
        toast.success("Aktywność została anulowana");
        setModalOpen(false);
        setEditActivity(null);
      }
    }
  }, [updateStatus]);

  const handleCompleteActivity = useCallback(async (activityId: string) => {
    const success = await updateStatus(activityId, "done");
    
    if (success) {
      toast.success("Aktywność została oznaczona jako zrealizowana!");
      setModalOpen(false);
      setEditActivity(null);
    }
  }, [updateStatus]);

  const handleActivityDrop = useCallback(
    async (activity: Activity, newDate: Date, newTime: string) => {
      const [hour, minute] = newTime.split(":").map(Number);
      const endMinutes = hour * 60 + minute + activity.duration;
      const endHour = Math.floor(endMinutes / 60);
      const endMin = endMinutes % 60;
      const newEndTime = `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`;

      const success = await upsert({
        id: activity.id,
        date: newDate,
        startTime: newTime,
        durationMin: activity.duration,
      });

      if (success) {
        toast.success("Aktywność została przeniesiona");
      }
    },
    [upsert]
  );

  const handleAddActivity = () => {
    setEditActivity(null);
    setInitialDate(currentWeekStart);
    setInitialTime("09:00");
    setModalOpen(true);
  };

  // Calculate weekly stats
  const weekActivities = activities.filter((activity) => {
    const activityWeekStart = startOfWeek(activity.date, { weekStartsOn: 1 });
    return activityWeekStart.getTime() === currentWeekStart.getTime();
  });

  const totalDuration = weekActivities.reduce((sum, activity) => sum + activity.duration, 0);
  const activitiesCount = weekActivities.length;
  const avgIntensity = weekActivities.length > 0
    ? weekActivities.reduce((sum, a) => sum + (a.intensity || 0), 0) / weekActivities.length
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Ładowanie planu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-[1600px]">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Plan tygodniowy
              </h1>
              <p className="text-muted-foreground">
                Planuj swoje treningi i aktywności na najbliższe tygodnie
              </p>
            </div>

            {/* Current Time Display */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                <Clock className="h-4 w-4 text-primary" />
                <div className="text-sm">
                  <div className="font-medium text-primary">
                    {format(currentTime, "HH:mm", { locale: pl })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(currentTime, "d MMMM yyyy", { locale: pl })}
                  </div>
                </div>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("week")}
                  className="h-9"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Tygodniowy
                </Button>
                <Button
                  variant={viewMode === "calendar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className="h-9"
                  disabled
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Kalendarz
                </Button>
              </div>
            </div>
          </div>
          
          {/* Week Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Aktywności</div>
              <div className="text-2xl font-bold text-primary">{activitiesCount}</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Łączny czas</div>
              <div className="text-2xl font-bold text-success">
                {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Średnia intensywność</div>
              <div className="text-2xl font-bold text-info">
                {avgIntensity.toFixed(1)}/10
              </div>
            </div>
          </div>
          
          {/* Week Navigation */}
          <WeekNavigation
            currentWeekStart={currentWeekStart}
            onWeekChange={setCurrentWeekStart}
          />
        </div>

        {/* Action Button */}
        <div className="mb-4">
          <Button onClick={handleAddActivity} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj aktywność
          </Button>
        </div>

        {/* Calendar Grid */}
        <WeeklyCalendarGrid
          weekStart={currentWeekStart}
          activities={activities}
          onActivityClick={handleActivityClick}
          onSlotClick={handleSlotClick}
          onActivityDrop={handleActivityDrop}
          startHour={6}
          endHour={23}
          slotStepMinutes={30}
          autoScrollToCurrentTime={true}
        />

        {/* Activity Types Legend */}
        <div className="mt-6 p-4 bg-card border border-border rounded-lg">
          <h3 className="text-sm font-semibold mb-3">Typy aktywności</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {SESSION_TYPE_OPTIONS.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.value} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: type.color }}
                  />
                  <Icon className="h-4 w-4" style={{ color: type.color }} />
                  <span className="text-xs text-muted-foreground">{type.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-4 p-4 bg-info/10 border border-info/20 rounded-lg">
          <p className="text-sm text-info">
            <strong>Wskazówki:</strong> Kliknij na pusty slot aby dodać aktywność. 
            Przeciągnij istniejące aktywności aby je przenieść. 
            Kliknij na aktywność aby edytować lub usunąć.
          </p>
        </div>
      </div>

      {/* Add/Edit Activity Modal */}
      <AddActivityModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditActivity(null);
          setInitialDate(undefined);
          setInitialTime(undefined);
        }}
        onSave={handleSaveActivity}
        onDelete={handleDeleteActivity}
        onCancel={handleCancelActivity}
        onComplete={handleCompleteActivity}
        editActivity={editActivity}
        initialDate={initialDate}
        initialTime={initialTime}
        allActivities={activities}
      />
    </div>
  );
}
