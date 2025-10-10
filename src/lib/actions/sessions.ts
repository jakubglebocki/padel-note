"use server";

/**
 * Server Actions for Sessions
 * CRUD operations for unified session management
 */

import { createClient } from "@/lib/supabase/server";
import { Session, SessionType, SessionStatus, validateSession, validateRating } from "@/lib/sessions";
import { revalidatePath } from "next/cache";

// ========================================
// Database Types (matching Supabase schema)
// ========================================

interface SessionRow {
  id: string;
  user_id: string;
  date: string;           // YYYY-MM-DD
  start_time: string;     // HH:mm:ss
  duration_min: number;
  title: string | null;
  type: SessionType;
  status: SessionStatus;
  intensity: number | null;
  difficulty: number | null;
  satisfaction: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ========================================
// Type Converters
// ========================================

function rowToSession(row: SessionRow): Session {
  return {
    id: row.id,
    userId: row.user_id,
    date: new Date(row.date),
    startTime: row.start_time.substring(0, 5), // Convert HH:mm:ss to HH:mm
    durationMin: row.duration_min,
    title: row.title || undefined,
    type: row.type,
    status: row.status,
    intensity: row.intensity || undefined,
    difficulty: row.difficulty || undefined,
    satisfaction: row.satisfaction || undefined,
    notes: row.notes || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function sessionToRow(session: Partial<Session> & { userId: string }): Partial<SessionRow> {
  const row: Partial<SessionRow> = {
    user_id: session.userId,
  };

  if (session.date) {
    row.date = session.date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  if (session.startTime) {
    row.start_time = session.startTime + ':00'; // HH:mm -> HH:mm:00
  }

  if (session.durationMin !== undefined) {
    row.duration_min = session.durationMin;
  }

  if (session.title !== undefined) {
    row.title = session.title || null;
  }

  if (session.type) {
    row.type = session.type;
  }

  if (session.status) {
    row.status = session.status;
  }

  if (session.intensity !== undefined) {
    row.intensity = session.intensity || null;
  }

  if (session.difficulty !== undefined) {
    row.difficulty = session.difficulty || null;
  }

  if (session.satisfaction !== undefined) {
    row.satisfaction = session.satisfaction || null;
  }

  if (session.notes !== undefined) {
    row.notes = session.notes || null;
  }

  return row;
}

// ========================================
// Result Types
// ========================================

type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// ========================================
// Session Actions
// ========================================

/**
 * List sessions by date range
 */
export async function listSessionsByRange(
  fromDate: Date,
  toDate: Date
): Promise<ActionResult<Session[]>> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Nie jesteś zalogowany" };
    }

    const fromStr = fromDate.toISOString().split('T')[0];
    const toStr = toDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', fromStr)
      .lte('date', toStr)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching sessions:', error);
      return { success: false, error: error.message };
    }

    const sessions = (data as SessionRow[]).map(rowToSession);
    return { success: true, data: sessions };
  } catch (error) {
    console.error('Unexpected error in listSessionsByRange:', error);
    return { success: false, error: 'Wystąpił nieoczekiwany błąd' };
  }
}

/**
 * Get single session by ID
 */
export async function getSessionById(id: string): Promise<ActionResult<Session>> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Nie jesteś zalogowany" };
    }

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching session:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Sesja nie została znaleziona' };
    }

    const session = rowToSession(data as SessionRow);
    return { success: true, data: session };
  } catch (error) {
    console.error('Unexpected error in getSessionById:', error);
    return { success: false, error: 'Wystąpił nieoczekiwany błąd' };
  }
}

/**
 * Create or update a session (upsert)
 */
export async function upsertSession(
  sessionData: Partial<Session> & { id?: string }
): Promise<ActionResult<Session>> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Nie jesteś zalogowany" };
    }

    // Validate session data
    const validationErrors = validateSession(sessionData);
    if (validationErrors.length > 0) {
      return { success: false, error: validationErrors.join(', ') };
    }

    const isUpdate = !!sessionData.id;
    const row = sessionToRow({ ...sessionData, userId: user.id });

    if (isUpdate) {
      // Update existing session
      const { data, error } = await supabase
        .from('sessions')
        .update(row)
        .eq('id', sessionData.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating session:', error);
        return { success: false, error: error.message };
      }

      const session = rowToSession(data as SessionRow);
      
      // Revalidate relevant paths
      revalidatePath('/plan');
      revalidatePath('/units');
      revalidatePath('/dashboard');
      
      return { success: true, data: session };
    } else {
      // Create new session
      const { data, error } = await supabase
        .from('sessions')
        .insert(row)
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        return { success: false, error: error.message };
      }

      const session = rowToSession(data as SessionRow);
      
      // Revalidate relevant paths
      revalidatePath('/plan');
      revalidatePath('/units');
      revalidatePath('/dashboard');
      
      return { success: true, data: session };
    }
  } catch (error) {
    console.error('Unexpected error in upsertSession:', error);
    return { success: false, error: 'Wystąpił nieoczekiwany błąd' };
  }
}

/**
 * Update session status (quick action)
 */
export async function updateSessionStatus(
  id: string,
  status: SessionStatus
): Promise<ActionResult<Session>> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Nie jesteś zalogowany" };
    }

    const { data, error } = await supabase
      .from('sessions')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating session status:', error);
      return { success: false, error: error.message };
    }

    const session = rowToSession(data as SessionRow);
    
    // Revalidate relevant paths
    revalidatePath('/plan');
    revalidatePath('/units');
    revalidatePath('/dashboard');
    
    return { success: true, data: session };
  } catch (error) {
    console.error('Unexpected error in updateSessionStatus:', error);
    return { success: false, error: 'Wystąpił nieoczekiwany błąd' };
  }
}

/**
 * Add rating to session and mark as done
 */
export async function rateSession(
  id: string,
  rating: { intensity: number; difficulty: number; satisfaction: number; notes?: string }
): Promise<ActionResult<Session>> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Nie jesteś zalogowany" };
    }

    // Validate rating
    const validationErrors = validateRating(rating);
    if (validationErrors.length > 0) {
      return { success: false, error: validationErrors.join(', ') };
    }

    const { data, error } = await supabase
      .from('sessions')
      .update({
        status: 'done',
        intensity: rating.intensity,
        difficulty: rating.difficulty,
        satisfaction: rating.satisfaction,
        notes: rating.notes || null,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error rating session:', error);
      return { success: false, error: error.message };
    }

    const session = rowToSession(data as SessionRow);
    
    // Revalidate relevant paths
    revalidatePath('/plan');
    revalidatePath('/units');
    revalidatePath('/dashboard');
    
    return { success: true, data: session };
  } catch (error) {
    console.error('Unexpected error in rateSession:', error);
    return { success: false, error: 'Wystąpił nieoczekiwany błąd' };
  }
}

/**
 * Delete session
 */
export async function deleteSession(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Nie jesteś zalogowany" };
    }

    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting session:', error);
      return { success: false, error: error.message };
    }

    // Revalidate relevant paths
    revalidatePath('/plan');
    revalidatePath('/units');
    revalidatePath('/dashboard');
    
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Unexpected error in deleteSession:', error);
    return { success: false, error: 'Wystąpił nieoczekiwany błąd' };
  }
}

/**
 * Bulk create sessions (for recurring activities)
 */
export async function bulkCreateSessions(
  sessions: Array<Omit<Session, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<ActionResult<Session[]>> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Nie jesteś zalogowany" };
    }

    // Validate all sessions
    for (const session of sessions) {
      const validationErrors = validateSession(session);
      if (validationErrors.length > 0) {
        return { success: false, error: validationErrors.join(', ') };
      }
    }

    // Convert to rows
    const rows = sessions.map(session => sessionToRow({ ...session, userId: user.id }));

    const { data, error } = await supabase
      .from('sessions')
      .insert(rows)
      .select();

    if (error) {
      console.error('Error bulk creating sessions:', error);
      return { success: false, error: error.message };
    }

    const createdSessions = (data as SessionRow[]).map(rowToSession);
    
    // Revalidate relevant paths
    revalidatePath('/plan');
    revalidatePath('/units');
    revalidatePath('/dashboard');
    
    return { success: true, data: createdSessions };
  } catch (error) {
    console.error('Unexpected error in bulkCreateSessions:', error);
    return { success: false, error: 'Wystąpił nieoczekiwany błąd' };
  }
}

