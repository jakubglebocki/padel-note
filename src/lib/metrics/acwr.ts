/**
 * ACWR (Acute:Chronic Workload Ratio) calculations
 * ACWR = Acute Load / Chronic Load
 */

export interface ACWRMetrics {
  acute: number; // Suma AU z ostatnich 7 dni
  chronic: number; // Chronic load (28 dni)
  acwr: number; // Stosunek Acute/Chronic
  status: 'optimal' | 'low_stimulation' | 'elevated_risk' | 'high_load';
  color: 'green' | 'blue' | 'yellow' | 'red';
  label: string;
}

/**
 * Oblicza ACWR i status na podstawie acute i chronic load
 */
export function calculateACWR(acute: number, chronic: number): ACWRMetrics {
  // ACWR = acute / max(chronic, 1) - minimum chronic = 1
  const acwr = acute / Math.max(chronic, 1);
  
  let status: ACWRMetrics['status'];
  let color: ACWRMetrics['color'];
  let label: string;
  
  if (acwr >= 0.8 && acwr <= 1.3) {
    status = 'optimal';
    color = 'green';
    label = 'Optymalne';
  } else if (acwr > 1.5) {
    status = 'high_load';
    color = 'red';
    label = 'Wysokie obciążenie';
  } else if (acwr >= 1.3 && acwr <= 1.5) {
    status = 'elevated_risk';
    color = 'yellow';
    label = 'Podwyższone ryzyko';
  } else {
    status = 'low_stimulation';
    color = 'blue';
    label = 'Niska stymulacja';
  }
  
  return {
    acute,
    chronic,
    acwr,
    status,
    color,
    label
  };
}

/**
 * Sprawdza czy chronic load jest wystarczający dla wiarygodnych obliczeń
 */
export function isChronicLoadReliable(chronic: number): boolean {
  return chronic > 0;
}

/**
 * Formatuje ACWR do wyświetlania
 */
export function formatACWR(acwr: number): string {
  return acwr.toFixed(2);
}

/**
 * Formatuje chronic load do wyświetlania
 */
export function formatChronicLoad(chronic: number): string {
  if (chronic === 0) return 'Brak bazy';
  return chronic.toFixed(1);
}



