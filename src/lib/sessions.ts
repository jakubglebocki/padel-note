/**
 * Unified Session types and utilities
 * Combines training units, matches, and other activities
 */

export type SessionType =
  | 'training_ind'
  | 'training_grp'
  | 'sparing'
  | 'match_league'
  | 'americano'
  | 'tournament'
  | 'gym'
  | 'recovery'
  | 'mobility'
  | 'watch_match'
  | 'machine_training';

export type SessionStatus = 'planned' | 'done' | 'canceled';

export interface Session {
  id: string;
  userId: string;
  type: SessionType;
  title?: string;
  date: Date;
  startTime: string; // HH:mm
  durationMin: number;
  status: SessionStatus;
  intensity?: number; // 1-10
  difficulty?: number; // 1-10
  satisfaction?: number; // 1-10
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const SESSION_TYPE_OPTIONS: Array<{ value: SessionType; label: string; color: string }> = [
  { value: 'training_ind', label: 'Trening indywidualny', color: '#FF6B35' },
  { value: 'training_grp', label: 'Trening grupowy', color: '#0EA5E9' },
  { value: 'sparing', label: 'Sparing', color: '#A855F7' },
  { value: 'match_league', label: 'Mecz ligowy', color: '#FFB800' },
  { value: 'americano', label: 'Americano', color: '#00D9B4' },
  { value: 'tournament', label: 'Turniej', color: '#F59E0B' },
  { value: 'gym', label: 'Siłownia', color: '#EF4444' },
  { value: 'recovery', label: 'Regeneracja', color: '#10B981' },
  { value: 'mobility', label: 'Mobilność', color: '#8B5CF6' },
  { value: 'watch_match', label: 'Oglądanie meczu', color: '#6B7280' },
  { value: 'machine_training', label: 'Trening z maszyną', color: '#38BDF8' },
];

/**
 * Calculate end time from start time and duration
 */
export function calculateEndTime(startTime: string, durationMin: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMin;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

/**
 * Validate session data
 */
export function validateSession(session: Partial<Session>): string[] {
  const errors: string[] = [];

  if (!session.type) errors.push('Typ sesji jest wymagany');
  if (!session.date) errors.push('Data jest wymagana');
  if (!session.startTime) errors.push('Godzina rozpoczęcia jest wymagana');
  if (!session.durationMin || session.durationMin <= 0) {
    errors.push('Czas trwania musi być większy od 0');
  }

  return errors;
}

/**
 * Validate rating data
 */
export function validateRating(rating: {
  intensity: number;
  difficulty: number;
  satisfaction: number;
}): string[] {
  const errors: string[] = [];

  if (rating.intensity < 1 || rating.intensity > 10) {
    errors.push('Intensywność musi być w zakresie 1-10');
  }
  if (rating.difficulty < 1 || rating.difficulty > 10) {
    errors.push('Trudność musi być w zakresie 1-10');
  }
  if (rating.satisfaction < 1 || rating.satisfaction > 10) {
    errors.push('Satysfakcja musi być w zakresie 1-10');
  }

  return errors;
}

