/**
 * Obliczenia procentu realizacji planu treningowego
 */

export interface Activity {
  id: string;
  date: string;
  type: 'training' | 'match' | 'sparing' | 'americano' | 'tournament' | 'gym';
  durationMin: number;
  sRPE?: number;
  status: 'planned' | 'done' | 'canceled';
}

export interface PlanRealization {
  percent: number; // 0-1
  doneCount: number;
  plannedCount: number;
  totalCount: number;
}

/**
 * Oblicza procent realizacji planu dla danego tygodnia
 * Liczy tylko aktywności typu 'training' i 'match'
 */
export function calculatePlanRealization(
  activities: Activity[],
  weekStart: string,
  weekEnd: string
): PlanRealization {
  const weekStartDate = new Date(weekStart);
  const weekEndDate = new Date(weekEnd);
  
  // Filtruj aktywności z danego tygodnia
  const weekActivities = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activityDate >= weekStartDate && activityDate <= weekEndDate;
  });
  
  // Filtruj tylko training i match
  const relevantActivities = weekActivities.filter(activity => 
    activity.type === 'training' || activity.type === 'match'
  );
  
  // Policz zaplanowane i zrealizowane
  const plannedCount = relevantActivities.filter(activity => 
    activity.status === 'planned' || activity.status === 'done'
  ).length;
  
  const doneCount = relevantActivities.filter(activity => 
    activity.status === 'done'
  ).length;
  
  const totalCount = relevantActivities.length;
  
  // Oblicz procent (minimum 1 zaplanowana aktywność)
  const percent = plannedCount > 0 ? doneCount / plannedCount : 0;
  
  return {
    percent: Math.min(percent, 1), // Maksymalnie 100%
    doneCount,
    plannedCount,
    totalCount
  };
}

/**
 * Formatuje procent do wyświetlania
 */
export function formatPercent(percent: number): string {
  return `${Math.round(percent * 100)}%`;
}

/**
 * Określa status realizacji planu na podstawie procentu
 */
export function getPlanStatus(percent: number): {
  status: 'excellent' | 'good' | 'fair' | 'poor';
  color: 'green' | 'yellow' | 'orange' | 'red';
  label: string;
} {
  if (percent >= 0.9) {
    return { status: 'excellent', color: 'green', label: 'Doskonała realizacja' };
  } else if (percent >= 0.7) {
    return { status: 'good', color: 'yellow', label: 'Dobra realizacja' };
  } else if (percent >= 0.5) {
    return { status: 'fair', color: 'orange', label: 'Średnia realizacja' };
  } else {
    return { status: 'poor', color: 'red', label: 'Niska realizacja' };
  }
}



