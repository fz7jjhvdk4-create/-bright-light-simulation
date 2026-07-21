"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

// Debounced autosave: saves `data` via `save` when it has been unchanged for
// `delayMs`. Nothing is written unless data differs from the last saved state,
// so loading existing content from the server never triggers a save — call
// `markSaved` with the loaded data to set the baseline.
export function useAutosave<T>(
  data: T,
  save: (data: T) => Promise<void>,
  delayMs = 2000
) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const lastSavedRef = useRef<string>(JSON.stringify(data));
  const saveRef = useRef(save);
  saveRef.current = save;

  const markSaved = useCallback((saved: T) => {
    lastSavedRef.current = JSON.stringify(saved);
    setStatus("idle");
  }, []);

  useEffect(() => {
    const serialized = JSON.stringify(data);
    if (serialized === lastSavedRef.current) return;

    setStatus("pending");
    const timer = setTimeout(async () => {
      if (JSON.stringify(data) === lastSavedRef.current) {
        setStatus("idle");
        return;
      }
      setStatus("saving");
      try {
        await saveRef.current(data);
        lastSavedRef.current = serialized;
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [data, delayMs]);

  return { status, markSaved };
}

// Shared status line so all autosaving forms speak the same language
export function autosaveLabel(status: AutosaveStatus): string {
  switch (status) {
    case "pending":
    case "saving":
      return "Sparar automatiskt…";
    case "saved":
      return "Autosparat ✓";
    case "error":
      return "Kunde inte autospara — spara manuellt";
    default:
      return "";
  }
}
