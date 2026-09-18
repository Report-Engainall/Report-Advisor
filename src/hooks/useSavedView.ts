import { useCallback, useEffect, useMemo, useState } from 'react';
import { resolveCurrentCompanyId, supabase } from '@/lib/supabase';

type JsonValue = string | number | boolean | null;
type SavedViewMap<T> = Record<string, T>;
const STORAGE_PREFIX = 'aghbari:saved-view:v1';

function safeParse<T>(value: string | null): T | null { if (!value) return null; try { return JSON.parse(value) as T; } catch { return null; } }

export function useSavedView<T extends Record<string, JsonValue>>(scope: string, initialValue: T) {
  const [storageKey, setStorageKey] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedViewMap<T>>({});
  const [activeName, setActiveName] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    void Promise.all([resolveCurrentCompanyId(), supabase.auth.getUser().then(({ data }) => data.user?.id ?? null)]).then(([companyId, userId]) => {
      if (!mounted || !companyId || !userId) return;
      const key = `${STORAGE_PREFIX}:${companyId}:${userId}:${scope}`;
      const parsed = safeParse<SavedViewMap<T>>(window.localStorage.getItem(key));
      setStorageKey(key); setSaved(parsed ?? {});
    }).catch(() => { if (mounted) setStorageKey(null); });
    return () => { mounted = false; };
  }, [scope]);
  const names = useMemo(() => Object.keys(saved).sort((a,b) => a.localeCompare(b,'ar')), [saved]);
  const persist = useCallback((next: SavedViewMap<T>) => { setSaved(next); if (!storageKey) return; try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch { return; } }, [storageKey]);
  const save = useCallback((name: string, value: T) => { const clean = name.trim(); if (!clean) return false; persist({ ...saved, [clean]: value }); setActiveName(clean); return true; }, [persist, saved]);
  const remove = useCallback((name: string) => { const next = { ...saved }; delete next[name]; persist(next); setActiveName(current => current === name ? null : current); }, [persist, saved]);
  const load = useCallback((name: string): T | null => { const value = saved[name] ?? null; if (value) setActiveName(name); return value; }, [saved]);
  const reset = useCallback(() => setActiveName(null), []);
  return { names, activeName, storageReady: Boolean(storageKey), save, load, remove, reset, initialValue };
}