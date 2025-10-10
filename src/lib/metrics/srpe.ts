/**
 * sRPE (subjective Rate of Perceived Exertion) calculations
 * AU (Arbitrary Units) = sRPE * durationMin
 */

export interface Activity {
  id: string;
  date: string;
  type: 'training' | 'match' | 'sparing' | 'americano' | 'tournament' | 'gym';
  durationMin: number;
  sRPE?: number;
  status: 'planned' | 'done' | 'canceled';
}

export interface HistoryAU {
  date: string;
  au: number;
}

export interface SRPEMetrics {
  sum7: number; // Suma AU z ostatnich 7 dni
  chronic28: number; // Chronic load (28 dni)
  dailyAU: HistoryAU[]; // Dzienne AU dla wykresów
}

/**
 * Oblicza AU dla pojedynczej aktywności
 */
export function calculateAU(activity: Activity): number {
  if (activity.status !== 'done' || !activity.sRPE) {
    return 0;
  }
  return activity.sRPE * activity.durationMin;
}

/**
 * Agreguje dzienne AU z aktywności
 */
export function aggregateDailyAU(activities: Activity[]): HistoryAU[] {
  const dailyMap = new Map<string, number>();
  
  activities.forEach(activity => {
    const au = calculateAU(activity);
    const existing = dailyMap.get(activity.date) || 0;
    dailyMap.set(activity.date, existing + au);
  });
  
  return Array.from(dailyMap.entries())
    .map(([date, au]) => ({ date, au }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Oblicza sumę AU z ostatnich 7 dni
 */
export function calculateSum7(dailyAU: HistoryAU[], today: string): number {
  const todayDate = new Date(today);
  const sevenDaysAgo = new Date(todayDate);
  sevenDaysAgo.setDate(todayDate.getDate() - 6); // 7 dni włącznie z dzisiaj
  
  return dailyAU
    .filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= sevenDaysAgo && itemDate <= todayDate;
    })
    .reduce((sum, item) => sum + item.au, 0);
}

/**
 * Oblicza chronic load (28 dni) - średnia AU
 */
export function calculateChronic28Avg(dailyAU: HistoryAU[], today: string): number {
  const todayDate = new Date(today);
  const twentyEightDaysAgo = new Date(todayDate);
  twentyEightDaysAgo.setDate(todayDate.getDate() - 27); // 28 dni włącznie z dzisiaj
  
  const relevantAU = dailyAU.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= twentyEightDaysAgo && itemDate <= todayDate;
  });
  
  if (relevantAU.length === 0) return 0;
  
  const totalAU = relevantAU.reduce((sum, item) => sum + item.au, 0);
  return totalAU / relevantAU.length;
}

/**
 * Oblicza chronic load (28 dni) - EWMA
 */
export function calculateChronic28EWMA(dailyAU: HistoryAU[], today: string): number {
  const todayDate = new Date(today);
  const twentyEightDaysAgo = new Date(todayDate);
  twentyEightDaysAgo.setDate(todayDate.getDate() - 27);
  
  const relevantAU = dailyAU
    .filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= twentyEightDaysAgo && itemDate <= todayDate;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
  
  if (relevantAU.length === 0) return 0;
  
  const lambda = 2 / (28 + 1); // λ = 2/(n+1) dla n=28
  let ewma = relevantAU[0].au;
  
  for (let i = 1; i < relevantAU.length; i++) {
    ewma = lambda * relevantAU[i].au + (1 - lambda) * ewma;
  }
  
  return ewma;
}

/**
 * Główna funkcja obliczająca metryki sRPE
 */
export function calculateSRPEMetrics(
  activities: Activity[],
  historyAU: HistoryAU[],
  today: string,
  acwrMethod: 'avg4w' | 'ewma28'
): SRPEMetrics {
  // Agreguj dzienne AU z aktywności
  const dailyAU = aggregateDailyAU(activities);
  
  // Połącz z historycznymi danymi
  const combinedAU = [...historyAU, ...dailyAU];
  
  // Usuń duplikaty (priorytet dla nowych danych)
  const uniqueAU = new Map<string, number>();
  combinedAU.forEach(item => {
    uniqueAU.set(item.date, item.au);
  });
  
  const finalDailyAU = Array.from(uniqueAU.entries())
    .map(([date, au]) => ({ date, au }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  // Oblicz metryki
  const sum7 = calculateSum7(finalDailyAU, today);
  const chronic28 = acwrMethod === 'avg4w' 
    ? calculateChronic28Avg(finalDailyAU, today)
    : calculateChronic28EWMA(finalDailyAU, today);
  
  return {
    sum7,
    chronic28,
    dailyAU: finalDailyAU
  };
}



