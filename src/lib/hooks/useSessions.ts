"use client";

/**
 * React Hook for Session Management
 * Provides unified session data management with real-time sync
 */

import { useState, useEffect, useCallback } from "react";
import { Session } from "@/lib/sessions";
import {
  listSessionsByRange,
  upsertSession,
  updateSessionStatus,
  rateSession,
  deleteSession,
  bulkCreateSessions,
} from "@/lib/actions/sessions";
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

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

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await listSessionsByRange(fromDate, toDate);

    if (result.success) {
      setSessions(result.data);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  }, [fromDate, toDate]);

  // Initial fetch
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Real-time subscription
  useEffect(() => {
    if (!enableRealtime) return;

    const supabase = createClient();
    let channel: RealtimeChannel | null = null;

    const setupRealtimeSubscription = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Subscribe to sessions changes for current user
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
          (payload) => {
            console.log('Realtime session change:', payload);
            
            // Refetch data on any change
            // Use the callback pattern to avoid dependency on fetchSessions
            setIsLoading(true);
            setError(null);
            listSessionsByRange(fromDate, toDate).then(result => {
              if (result.success) {
                setSessions(result.data);
              } else {
                setError(result.error);
              }
              setIsLoading(false);
            });
          }
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    // Cleanup
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [enableRealtime, fromDate, toDate]);

  // Upsert session
  const upsert = useCallback(async (sessionData: Partial<Session> & { id?: string }): Promise<boolean> => {
    const result = await upsertSession(sessionData);
    
    if (result.success) {
      // Optimistic update
      if (sessionData.id) {
        // Update existing
        setSessions(prev => prev.map(s => s.id === sessionData.id ? result.data : s));
      } else {
        // Add new
        setSessions(prev => [...prev, result.data]);
      }
      return true;
    } else {
      setError(result.error);
      return false;
    }
  }, []);

  // Update status
  const updateStatus = useCallback(async (id: string, status: Session['status']): Promise<boolean> => {
    const result = await updateSessionStatus(id, status);
    
    if (result.success) {
      // Optimistic update
      setSessions(prev => prev.map(s => s.id === id ? result.data : s));
      return true;
    } else {
      setError(result.error);
      return false;
    }
  }, []);

  // Rate session
  const rate = useCallback(async (
    id: string,
    rating: { intensity: number; difficulty: number; satisfaction: number; notes?: string }
  ): Promise<boolean> => {
    const result = await rateSession(id, rating);
    
    if (result.success) {
      // Optimistic update
      setSessions(prev => prev.map(s => s.id === id ? result.data : s));
      return true;
    } else {
      setError(result.error);
      return false;
    }
  }, []);

  // Delete session
  const remove = useCallback(async (id: string): Promise<boolean> => {
    const result = await deleteSession(id);
    
    if (result.success) {
      // Optimistic update
      setSessions(prev => prev.filter(s => s.id !== id));
      return true;
    } else {
      setError(result.error);
      return false;
    }
  }, []);

  // Bulk create sessions
  const bulkCreate = useCallback(async (
    newSessions: Array<Omit<Session, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<boolean> => {
    const result = await bulkCreateSessions(newSessions);
    
    if (result.success) {
      // Optimistic update
      setSessions(prev => [...prev, ...result.data]);
      return true;
    } else {
      setError(result.error);
      return false;
    }
  }, []);

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

