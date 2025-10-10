"use client";

import { useState, useEffect, useCallback } from "react";
import { Session } from "@/lib/sessions";
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { toast } from "sonner";

interface UseSessionsOptions {
  fromDate: Date;
  toDate: Date;
  enableRealtime?: boolean;
}

interface UseSessionsReturn {
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  upsert: (session: Partial<Session> & { id?: string }) => Promise<boolean>;
  updateStatus: (id: string, status: Session['status']) => Promise<boolean>;
  rate: (id: string, rating: { intensity: number; difficulty: number; satisfaction: number; notes?: string }) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  bulkCreate: (sessions: Array<Omit<Session, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<boolean>;
}

export function useSessions(options: UseSessionsOptions): UseSessionsReturn {
  const { fromDate, toDate, enableRealtime = true } = options;
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Nie jesteś zalogowany");
        setSessions([]);
        setIsLoading(false);
        return;
      }

      const fromStr = fromDate.toISOString().split('T')[0];
      const toStr = toDate.toISOString().split('T')[0];

      const { data, error: fetchError } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', fromStr)
        .lte('date', toStr)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (fetchError) {
        console.error('Error fetching sessions:', fetchError);
        setError(fetchError.message);
        setSessions([]);
      } else {
        const mappedSessions: Session[] = (data || []).map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          date: new Date(row.date),
          startTime: row.start_time.substring(0, 5),
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
        }));
        setSessions(mappedSessions);
      }
    } catch (err) {
      console.error('Unexpected error in fetchSessions:', err);
      setError('Wystąpił nieoczekiwany błąd');
      setSessions([]);
    }

    setIsLoading(false);
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (!enableRealtime) return;

    const supabase = createClient();
    let channel: RealtimeChannel | null = null;

    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('sessions-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'sessions',
            filter: `user_id=eq.${user.id}`,
          },
          () => fetchSessions()
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [enableRealtime, fetchSessions]);

  const upsert = useCallback(async (sessionData: Partial<Session> & { id?: string }): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Nie jesteś zalogowany");
        return false;
      }

      const isUpdate = !!sessionData.id;
      const row: any = { user_id: user.id };

      if (sessionData.date) row.date = sessionData.date.toISOString().split('T')[0];
      if (sessionData.startTime) row.start_time = sessionData.startTime + ':00';
      if (sessionData.durationMin !== undefined) row.duration_min = sessionData.durationMin;
      if (sessionData.title !== undefined) row.title = sessionData.title || null;
      if (sessionData.type) row.type = sessionData.type;
      if (sessionData.status) row.status = sessionData.status;
      if (sessionData.intensity !== undefined) row.intensity = sessionData.intensity || null;
      if (sessionData.difficulty !== undefined) row.difficulty = sessionData.difficulty || null;
      if (sessionData.satisfaction !== undefined) row.satisfaction = sessionData.satisfaction || null;
      if (sessionData.notes !== undefined) row.notes = sessionData.notes || null;

      if (isUpdate) {
        const { error } = await supabase
          .from('sessions')
          .update(row)
          .eq('id', sessionData.id)
          .eq('user_id', user.id);

        if (error) {
          toast.error("Błąd aktualizacji");
          return false;
        }
      } else {
        const { error } = await supabase.from('sessions').insert(row);
        if (error) {
          toast.error("Błąd tworzenia");
          return false;
        }
      }

      await fetchSessions();
      toast.success(isUpdate ? "Zaktualizowano" : "Dodano");
      return true;
    } catch (error) {
      toast.error("Wystąpił błąd");
      return false;
    }
  }, [fetchSessions]);

  const updateStatus = useCallback(async (id: string, status: Session['status']): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const { error } = await supabase
        .from('sessions')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) return false;
      await fetchSessions();
      return true;
    } catch {
      return false;
    }
  }, [fetchSessions]);

  const rate = useCallback(async (
    id: string,
    rating: { intensity: number; difficulty: number; satisfaction: number; notes?: string }
  ): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const { error } = await supabase
        .from('sessions')
        .update({
          status: 'done',
          intensity: rating.intensity,
          difficulty: rating.difficulty,
          satisfaction: rating.satisfaction,
          notes: rating.notes || null,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) return false;
      await fetchSessions();
      toast.success("Oceniono");
      return true;
    } catch {
      return false;
    }
  }, [fetchSessions]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) return false;
      await fetchSessions();
      toast.success("Usunięto");
      return true;
    } catch {
      return false;
    }
  }, [fetchSessions]);

  const bulkCreate = useCallback(async (
    newSessions: Array<Omit<Session, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const rows = newSessions.map(session => ({
        user_id: user.id,
        date: session.date.toISOString().split('T')[0],
        start_time: session.startTime + ':00',
        duration_min: session.durationMin,
        title: session.title || null,
        type: session.type,
        status: session.status,
        intensity: session.intensity || null,
        difficulty: session.difficulty || null,
        satisfaction: session.satisfaction || null,
        notes: session.notes || null,
      }));

      const { error } = await supabase.from('sessions').insert(rows);
      if (error) return false;

      await fetchSessions();
      toast.success("Utworzono serię");
      return true;
    } catch {
      return false;
    }
  }, [fetchSessions]);

  return {
    sessions,
    isLoading,
    error,
    refetch: fetchSessions,
    upsert,
    updateStatus,
    rate,
    remove,
    bulkCreate,
  };
}
