import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const FREE_LIMIT = 3;

function getSessionId(): string {
  let id = localStorage.getItem('twm_session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('twm_session_id', id);
  }
  return id;
}

export function useUsageGate(toolName: string) {
  const { user } = useAuth();
  const [usedCount, setUsedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const sessionId = getSessionId();

  const remaining = Math.max(0, FREE_LIMIT - usedCount);
  const blocked = !user && remaining <= 0;

  const fetchCount = useCallback(async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let query = supabase
      .from('tool_usage')
      .select('id', { count: 'exact', head: true })
      .eq('tool_name', toolName)
      .gte('used_at', todayStart.toISOString());

    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.eq('session_id', sessionId).is('user_id', null);
    }

    const { count } = await query;
    setUsedCount(count ?? 0);
    setLoading(false);
  }, [toolName, user, sessionId]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  const recordUsage = useCallback(async () => {
    await supabase.from('tool_usage').insert({
      tool_name: toolName,
      session_id: sessionId,
      user_id: user?.id ?? null,
    });
    await fetchCount();
  }, [toolName, sessionId, user, fetchCount]);

  return { remaining, blocked, loading, recordUsage, usedCount, limit: FREE_LIMIT };
}
