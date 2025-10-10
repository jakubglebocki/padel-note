import { 
  User, 
  Users, 
  Swords, 
  Trophy, 
  PartyPopper, 
  Medal, 
  Dumbbell, 
  Heart, 
  Workflow,
  Eye,
  Cog
} from "lucide-react";

export type ActivityType = 
  | "individual_training"
  | "group_training"
  | "sparring"
  | "league_match"
  | "americano"
  | "tournament"
  | "gym"
  | "recovery"
  | "mobility"
  | "watch_match"
  | "machine_training";

export interface ActivityTypeConfig {
  id: ActivityType;
  label: string;
  icon: typeof User;
  color: string;
  bgColor: string;
  borderColor: string;
  category: "training" | "competition" | "recovery" | "other";
  countsTowardCompletion: boolean;
  defaultDuration: number; // in minutes
  requiresTrainerApproval: boolean; // Czy wymaga akceptacji trenera
}

export const ACTIVITY_TYPES: Record<ActivityType, ActivityTypeConfig> = {
  individual_training: {
    id: "individual_training",
    label: "Trening indywidualny (Trener)",
    icon: User,
    color: "#FF6B35", // primary
    bgColor: "rgba(255, 107, 53, 0.15)",
    borderColor: "rgba(255, 107, 53, 0.3)",
    category: "training",
    countsTowardCompletion: true,
    defaultDuration: 90,
    requiresTrainerApproval: true, // Wymaga akceptacji trenera
  },
  group_training: {
    id: "group_training",
    label: "Trening grupowy (Trener)",
    icon: Users,
    color: "#0EA5E9", // info
    bgColor: "rgba(14, 165, 233, 0.15)",
    borderColor: "rgba(14, 165, 233, 0.3)",
    category: "training",
    countsTowardCompletion: true,
    defaultDuration: 90,
    requiresTrainerApproval: true, // Wymaga akceptacji trenera
  },
  sparring: {
    id: "sparring",
    label: "Sparing",
    icon: Swords,
    color: "#A855F7", // purple
    bgColor: "rgba(168, 85, 247, 0.15)",
    borderColor: "rgba(168, 85, 247, 0.3)",
    category: "training",
    countsTowardCompletion: true,
    defaultDuration: 120,
    requiresTrainerApproval: false,
  },
  league_match: {
    id: "league_match",
    label: "Mecz Ligowy",
    icon: Trophy,
    color: "#FFB800", // logo gold
    bgColor: "rgba(255, 184, 0, 0.15)",
    borderColor: "rgba(255, 184, 0, 0.3)",
    category: "competition",
    countsTowardCompletion: true,
    defaultDuration: 120,
    requiresTrainerApproval: false,
  },
  americano: {
    id: "americano",
    label: "Americano",
    icon: PartyPopper,
    color: "#00D9B4", // cyan
    bgColor: "rgba(0, 217, 180, 0.15)",
    borderColor: "rgba(0, 217, 180, 0.3)",
    category: "competition",
    countsTowardCompletion: true,
    defaultDuration: 180,
    requiresTrainerApproval: false,
  },
  tournament: {
    id: "tournament",
    label: "Turniej",
    icon: Medal,
    color: "#F59E0B", // amber
    bgColor: "rgba(245, 158, 11, 0.15)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    category: "competition",
    countsTowardCompletion: true,
    defaultDuration: 240,
    requiresTrainerApproval: false,
  },
  gym: {
    id: "gym",
    label: "Siłownia",
    icon: Dumbbell,
    color: "#EF4444", // danger
    bgColor: "rgba(239, 68, 68, 0.15)",
    borderColor: "rgba(239, 68, 68, 0.3)",
    category: "training",
    countsTowardCompletion: true,
    defaultDuration: 60,
    requiresTrainerApproval: false,
  },
  recovery: {
    id: "recovery",
    label: "Regeneracja",
    icon: Heart,
    color: "#10B981", // emerald
    bgColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "rgba(16, 185, 129, 0.3)",
    category: "recovery",
    countsTowardCompletion: true,
    defaultDuration: 60,
    requiresTrainerApproval: false,
  },
  mobility: {
    id: "mobility",
    label: "Mobilność",
    icon: Workflow,
    color: "#8B5CF6", // violet
    bgColor: "rgba(139, 92, 246, 0.15)",
    borderColor: "rgba(139, 92, 246, 0.3)",
    category: "recovery",
    countsTowardCompletion: true,
    defaultDuration: 45,
    requiresTrainerApproval: false,
  },
  watch_match: {
    id: "watch_match",
    label: "Oglądanie meczu",
    icon: Eye,
    color: "#6B7280", // gray
    bgColor: "rgba(107, 114, 128, 0.15)",
    borderColor: "rgba(107, 114, 128, 0.3)",
    category: "other",
    countsTowardCompletion: false, // nie liczy się do % realizacji
    defaultDuration: 120,
    requiresTrainerApproval: false,
  },
  machine_training: {
    id: "machine_training",
    label: "Trening z maszyną",
    icon: Cog,
    color: "#38BDF8", // sky
    bgColor: "rgba(56, 189, 248, 0.15)",
    borderColor: "rgba(56, 189, 248, 0.3)",
    category: "training",
    countsTowardCompletion: true,
    defaultDuration: 90,
    requiresTrainerApproval: false,
  },
};

export const ACTIVITY_TYPE_OPTIONS = Object.values(ACTIVITY_TYPES);

export type ActivityStatus = 
  | "scheduled"           // Zaplanowana
  | "pending_approval"    // Oczekuje na akceptację trenera
  | "confirmed"           // Potwierdzona przez trenera
  | "in_progress"         // W trakcie (data i godzina już minęła)
  | "completed"           // Zrealizowana (po zaznaczeniu + ocena)
  | "cancelled";          // Anulowana

export interface Activity {
  id: string;
  type: ActivityType;
  title?: string; // optional custom title
  date: Date;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  duration: number; // in minutes
  allDay: boolean;
  notes?: string;
  status: ActivityStatus; // Status aktywności
  // Repeat functionality
  isRecurring: boolean;
  recurringId?: string; // all instances in series share this
  recurringWeeklyCount?: number; // how many weeks to repeat
  // Rating (for compatibility with sessions)
  intensity?: number; // 1-10 scale
}

export interface TimeSlot {
  hour: number;
  minute: number;
  label: string; // "06:00"
}

export interface CalendarGridConfig {
  startHour: number;
  endHour: number;
  slotStepMinutes: number;
  weekStart: Date;
  weekEnd: Date;
  timezone: string;
  locale: string;
}

// Helper functions
export function getActivityTypeConfig(type: ActivityType): ActivityTypeConfig {
  return ACTIVITY_TYPES[type];
}

export function formatTime(hour: number, minute: number = 0): string {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

export function parseTime(timeStr: string): { hour: number; minute: number } {
  const [hour, minute] = timeStr.split(":").map(Number);
  return { hour, minute };
}

export function generateTimeSlots(
  startHour: number,
  endHour: number,
  stepMinutes: number
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += stepMinutes) {
      if (hour === endHour && minute > 0) break;
      
      slots.push({
        hour,
        minute,
        label: formatTime(hour, minute),
      });
    }
  }
  
  return slots;
}

export function detectCollisions(
  activity: Activity,
  allActivities: Activity[]
): Activity[] {
  const collisions: Activity[] = [];
  
  for (const other of allActivities) {
    if (other.id === activity.id) continue;
    if (other.date.toDateString() !== activity.date.toDateString()) continue;
    if (other.allDay || activity.allDay) continue;
    
    const activityStart = parseTime(activity.startTime);
    const activityEnd = parseTime(activity.endTime);
    const otherStart = parseTime(other.startTime);
    const otherEnd = parseTime(other.endTime);
    
    const activityStartMins = activityStart.hour * 60 + activityStart.minute;
    const activityEndMins = activityEnd.hour * 60 + activityEnd.minute;
    const otherStartMins = otherStart.hour * 60 + otherStart.minute;
    const otherEndMins = otherEnd.hour * 60 + otherEnd.minute;
    
    // Check for overlap
    if (
      (activityStartMins < otherEndMins && activityEndMins > otherStartMins) ||
      (otherStartMins < activityEndMins && otherEndMins > activityStartMins)
    ) {
      collisions.push(other);
    }
  }
  
  return collisions;
}

export function calculateDuration(startTime: string, endTime: string): number {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  
  const startMins = start.hour * 60 + start.minute;
  const endMins = end.hour * 60 + end.minute;
  
  return endMins - startMins;
}

export function getInitialStatus(activityType: ActivityType): ActivityStatus {
  const config = getActivityTypeConfig(activityType);
  return config.requiresTrainerApproval ? "pending_approval" : "scheduled";
}

export function getStatusLabel(status: ActivityStatus): string {
  const labels: Record<ActivityStatus, string> = {
    scheduled: "Zaplanowana",
    pending_approval: "Oczekuje na akceptację trenera",
    confirmed: "Potwierdzona przez trenera",
    in_progress: "W trakcie",
    completed: "Zrealizowana",
    cancelled: "Anulowana",
  };
  return labels[status];
}

export function getStatusColor(status: ActivityStatus): string {
  const colors: Record<ActivityStatus, string> = {
    scheduled: "#0EA5E9", // info
    pending_approval: "#FBBF24", // warning
    confirmed: "#00D9B4", // success
    in_progress: "#FF6B35", // primary orange
    completed: "#10B981", // emerald
    cancelled: "#6B7280", // gray
  };
  return colors[status];
}

// Helper functions for status determination
export function isActivityInPast(activity: Activity, currentTime: Date = new Date()): boolean {
  const activityDateTime = new Date(activity.date);
  const [hour, minute] = activity.startTime.split(':').map(Number);
  activityDateTime.setHours(hour, minute, 0, 0);
  
  return activityDateTime < currentTime;
}

export function isActivityToday(activity: Activity, currentTime: Date = new Date()): boolean {
  const activityDate = new Date(activity.date);
  const today = new Date(currentTime);
  
  return activityDate.toDateString() === today.toDateString();
}

export function getAutoStatus(activity: Activity, currentTime: Date = new Date()): ActivityStatus {
  // Don't override completed or cancelled activities
  if (activity.status === 'completed' || activity.status === 'cancelled') {
    return activity.status;
  }
  
  // Check if activity is in the past
  if (isActivityInPast(activity, currentTime) && isActivityToday(activity, currentTime)) {
    return 'in_progress';
  }
  
  // Return the original status for future activities
  return activity.status;
}

