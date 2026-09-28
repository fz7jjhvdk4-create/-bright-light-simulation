"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { evaluateGate3, Gate3Requirement } from "@/lib/gate-requirements";

// Live requirement checklist shown next to the Gate 3 submit button.
// Same evaluation as the server uses, so the button state never lies.
export function Gate3Checklist({
  groupCode,
  interviewsCount,
  onEvaluated,
}: {
  groupCode: string;
  interviewsCount: number;
  onEvaluated: (allMet: boolean) => void;
}) {
  const [items, setItems] = useState<Gate3Requirement[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let completed7qc: string[] = [];
      let completed7qm: string[] = [];
      try {
        const response = await fetch(`/api/groups/${groupCode}/investigation-tools`);
        const json = await response.json();
        completed7qc = json?.data?.tools7qc?.completedTools ?? [];
        completed7qm = json?.data?.tools7qm?.completedTools ?? [];
      } catch {
        // offline — evaluate with what we have; the server has the final say
      }
      if (cancelled) return;
      const { items: evaluated, allMet } = evaluateGate3(interviewsCount, completed7qc, completed7qm);
      setItems(evaluated);
      onEvaluated(allMet);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupCode, interviewsCount]);

  if (!items) {
    return <p className="text-xs text-orange-600 dark:text-orange-400 mb-3">Kontrollerar krav…</p>;
  }

  return (
    <div className="text-xs mb-3 space-y-1">
      <p className="text-orange-700 dark:text-orange-300 font-medium">Krav för att boka styrgruppsmötet:</p>
      <ul className="space-y-1">
        {items.map(item => (
          <li key={item.label} className="flex items-center gap-1.5">
            {item.met ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400 flex-shrink-0" />
            )}
            <span className={item.met ? "text-green-700 dark:text-green-300" : "text-orange-700 dark:text-orange-300"}>
              {item.label}: {item.current} av {item.required}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
