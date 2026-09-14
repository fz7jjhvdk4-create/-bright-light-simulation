"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAutosave } from "./useAutosave";

type ToolField = "tools7qc" | "tools7qm" | "fiveWhy";

// Server-backed persistence for the investigation tools (7QC, 7QM, 5 Varför).
// Load order: server -> localStorage (offline reserve / migration of groups
// that only saved locally before) -> the component's default state. Changes
// autosave to /api/groups/[code]/investigation-tools, which the teacher's
// group page and the lab report read; localStorage is kept as a backup copy.
export function useInvestigationToolStorage<T>(
  groupCode: string,
  field: ToolField,
  localStorageKey: string,
  state: T,
  setState: (value: T) => void,
  migrateLoaded?: (raw: unknown) => T
) {
  const [loaded, setLoaded] = useState(false);
  const migrateRef = useRef(migrateLoaded);
  migrateRef.current = migrateLoaded;
  const setStateRef = useRef(setState);
  setStateRef.current = setState;

  const save = useCallback(async (data: T) => {
    // localStorage as offline reserve — best effort
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(data));
    } catch {
      // private browsing / blocked storage — the server copy is what matters
    }
    const response = await fetch(`/api/groups/${groupCode}/investigation-tools`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: data }),
    });
    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(json.error || "Kunde inte spara");
    }
  }, [groupCode, field, localStorageKey]);

  const { status, markSaved } = useAutosave(state, save);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const adopt = (raw: unknown, fromServer: boolean) => {
        const value = migrateRef.current ? migrateRef.current(raw) : (raw as T);
        if (fromServer) {
          // Server data is the saved baseline — don't re-upload it
          markSaved(value);
        }
        // Local-only data keeps the (empty) baseline, so the autosave
        // uploads it: old groups migrate to the server automatically
        setStateRef.current(value);
      };

      try {
        const response = await fetch(`/api/groups/${groupCode}/investigation-tools`);
        const json = await response.json();
        const serverData = json?.data?.[field];
        if (cancelled) return;
        if (serverData) {
          adopt(serverData, true);
          setLoaded(true);
          return;
        }
      } catch {
        // offline — fall through to localStorage
      }
      if (cancelled) return;
      try {
        const local = localStorage.getItem(localStorageKey);
        if (local) {
          adopt(JSON.parse(local), false);
        }
      } catch {
        // corrupt local data — start from defaults
      }
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [groupCode, field, localStorageKey, markSaved]);

  const saveNow = useCallback(async () => {
    await save(state);
    markSaved(state);
  }, [save, state, markSaved]);

  return { status, loaded, saveNow };
}
