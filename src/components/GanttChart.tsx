"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Save, Image as ImageIcon, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { exportAsImage, exportAsPDF, downloadBlob } from "@/lib/export-utils";

interface GanttTask {
  id: string;
  name: string;
  startWeek: number;
  duration: number; // in weeks
  color: string;
  isMilestone?: boolean;
}

interface GanttChartProps {
  groupCode: string;
}

const defaultTasks: GanttTask[] = [
  { id: "g1", name: "Gate 1: Projektdirektiv", startWeek: 1, duration: 0, color: "bg-purple-500", isMilestone: true },
  { id: "g2", name: "Gate 2: Projektplan klar", startWeek: 4, duration: 0, color: "bg-purple-500", isMilestone: true },
  { id: "g3", name: "Gate 3: Utredning klar", startWeek: 14, duration: 0, color: "bg-purple-500", isMilestone: true },
  { id: "g4", name: "Gate 4: Slutredovisning", startWeek: 24, duration: 0, color: "bg-purple-500", isMilestone: true },
];

const TOTAL_WEEKS = 26;
const WEEK_WIDTH = 40;

const taskColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-orange-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-cyan-500",
];

export function GanttChart({ groupCode }: GanttChartProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<GanttTask[]>(defaultTasks);
  const [saved, setSaved] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load saved data. Older versions gave every added task the id "NaN"
  // (issue #2), so duplicate/invalid ids are reassigned on load.
  useEffect(() => {
    const savedData = localStorage.getItem(`gantt-${groupCode}`);
    if (savedData) {
      const parsed = JSON.parse(savedData) as GanttTask[];
      const seen = new Set<string>();
      setTasks(parsed.map((task, index) => {
        let id = task.id;
        if (!id || id === "NaN" || seen.has(id)) {
          id = `t${index}-${Date.now()}`;
        }
        seen.add(id);
        return { ...task, id };
      }));
    }
  }, [groupCode]);

  const handleSave = () => {
    localStorage.setItem(`gantt-${groupCode}`, JSON.stringify(tasks));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateTask = (id: string, updates: Partial<GanttTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    setSaved(false);
  };

  const addTask = () => {
    // Timestamp id — the old parseInt-based scheme produced "NaN" for every
    // new task since the default ids are non-numeric ("g1"..."g4")
    const newId = `t${Date.now()}`;
    const newColor = taskColors[tasks.length % taskColors.length];
    setTasks([...tasks, {
      id: newId,
      name: "Ny aktivitet",
      startWeek: 1,
      duration: 2,
      color: newColor
    }]);
    setSaved(false);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setSaved(false);
  };

  const handleExportImage = async () => {
    try {
      const blob = await exportAsImage("gantt-content", `gantt-${groupCode}.png`);
      downloadBlob(blob, `gantt-${groupCode}.png`);
    } catch (error) {
      console.error("Export error:", error);
      alert("Kunde inte exportera som bild");
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await exportAsPDF("gantt-content", `gantt-${groupCode}.pdf`, "Gantt-schema");
      downloadBlob(blob, `gantt-${groupCode}.pdf`);
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Kunde inte exportera som PDF");
    }
  };

  // Drag to move a bar (or milestone), drag the right edge to resize (issue #1).
  // Pointer events with capture, so the drag survives leaving the bar.
  const dragRef = useRef<{
    taskId: string;
    mode: "move" | "resize";
    startX: number;
    origStart: number;
    origDuration: number;
    moved: boolean;
    lastApplied: number;
  } | null>(null);

  const handleBarPointerDown = (e: React.PointerEvent, task: GanttTask, mode: "move" | "resize") => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      taskId: task.id,
      mode,
      startX: e.clientX,
      origStart: task.startWeek,
      origDuration: task.duration,
      moved: false,
      lastApplied: mode === "move" ? task.startWeek : task.duration,
    };
  };

  const handleBarPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const deltaWeeks = Math.round((e.clientX - drag.startX) / WEEK_WIDTH);
    if (deltaWeeks !== 0) drag.moved = true;

    if (drag.mode === "move") {
      const lastStart = drag.origDuration > 0 ? TOTAL_WEEKS - drag.origDuration + 1 : TOTAL_WEEKS;
      const newStart = Math.min(Math.max(1, drag.origStart + deltaWeeks), Math.max(1, lastStart));
      if (newStart !== drag.lastApplied) {
        drag.lastApplied = newStart;
        updateTask(drag.taskId, { startWeek: newStart });
      }
    } else {
      const newDuration = Math.min(Math.max(1, drag.origDuration + deltaWeeks), TOTAL_WEEKS - drag.origStart + 1);
      if (newDuration !== drag.lastApplied) {
        drag.lastApplied = newDuration;
        updateTask(drag.taskId, { duration: newDuration });
      }
    }
  };

  const handleBarPointerUp = (task: GanttTask) => {
    const drag = dragRef.current;
    dragRef.current = null;
    // A plain click (no movement) opens the editor panel
    if (drag && !drag.moved) {
      setEditingTask(task.id);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newPosition = direction === "left"
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;
      scrollContainerRef.current.scrollLeft = newPosition;
      setScrollPosition(newPosition);
    }
  };

  // Generate month labels
  const getMonthLabel = (week: number): string => {
    const months = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
    const monthIndex = Math.floor((week - 1) / 4) % 12;
    return months[monthIndex];
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Gantt-schema</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExportImage}>
              <ImageIcon className="w-4 h-4 mr-1" />
              PNG
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportPDF}>
              <FileText className="w-4 h-4 mr-1" />
              PDF
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              {saved ? "Sparat!" : "Spara"}
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Dra i staplarna för att flytta aktiviteter, dra i högerkanten för att ändra längd — eller skriv start och antal veckor direkt i fälten. Klicka på en stapel eller ett namn för fler alternativ.
        </p>
      </div>

      <div id="gantt-content" className="flex-1 overflow-hidden p-4 bg-white dark:bg-gray-800" ref={contentRef}>
        {/* Scroll controls */}
        <div className="flex items-center justify-between mb-4">
          <Button size="sm" variant="outline" onClick={() => scroll("left")}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-500 dark:text-gray-400">Projekttid: 26 veckor (6 månader)</span>
          <Button size="sm" variant="outline" onClick={() => scroll("right")}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Gantt chart container */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto border rounded-lg"
          onScroll={(e) => setScrollPosition((e.target as HTMLDivElement).scrollLeft)}
        >
          <div style={{ minWidth: `${TOTAL_WEEKS * WEEK_WIDTH + 340}px` }}>
            {/* Header row with weeks */}
            <div className="flex border-b bg-gray-50 dark:bg-gray-900 sticky top-0">
              <div className="w-[340px] min-w-[340px] p-2 font-medium text-sm border-r flex items-end gap-2">
                <span className="flex-1">Aktivitet</span>
                <span className="w-14 text-center text-xs text-gray-500 dark:text-gray-400 font-normal">Start</span>
                <span className="w-14 text-center text-xs text-gray-500 dark:text-gray-400 font-normal">Veckor</span>
                <span className="w-4" />
              </div>
              <div className="flex">
                {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
                  <div
                    key={i}
                    className={`text-center text-xs border-r ${
                      (i + 1) % 4 === 1 ? "border-l-2 border-l-gray-400" : ""
                    }`}
                    style={{ width: WEEK_WIDTH }}
                  >
                    <div className="bg-gray-100 dark:bg-gray-800 py-1 border-b text-gray-600 dark:text-gray-400">
                      {(i + 1) % 4 === 1 ? getMonthLabel(i + 1) : ""}
                    </div>
                    <div className="py-1">V{i + 1}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Task rows */}
            {tasks.map((task) => (
              <div key={task.id} className="flex border-b hover:bg-gray-50 dark:hover:bg-gray-800 group">
                {/* Task name + always-visible time fields (issues #1/#2) */}
                <div className="w-[340px] min-w-[340px] p-2 border-r flex items-center gap-2">
                  <div className={`w-3 h-3 rounded flex-shrink-0 ${task.color}`} />
                  <span
                    className="flex-1 text-sm cursor-pointer hover:text-yellow-600 dark:hover:text-yellow-400 truncate min-w-0"
                    onClick={() => setEditingTask(task.id)}
                    title={`${task.name} — klicka för att redigera`}
                  >
                    {task.name}
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={TOTAL_WEEKS}
                    value={task.startWeek}
                    onChange={(e) => updateTask(task.id, { startWeek: Math.min(Math.max(1, parseInt(e.target.value) || 1), TOTAL_WEEKS) })}
                    className="w-14 px-1 py-0.5 border rounded text-sm text-center"
                    aria-label={`Startvecka för ${task.name}`}
                  />
                  {task.isMilestone ? (
                    <span className="w-14 text-center text-xs text-gray-400 dark:text-gray-500" title="Milstolpe har ingen längd">—</span>
                  ) : (
                    <input
                      type="number"
                      min={1}
                      max={TOTAL_WEEKS}
                      value={task.duration}
                      onChange={(e) => updateTask(task.id, { duration: Math.min(Math.max(1, parseInt(e.target.value) || 1), TOTAL_WEEKS) })}
                      className="w-14 px-1 py-0.5 border rounded text-sm text-center"
                      aria-label={`Längd i veckor för ${task.name}`}
                    />
                  )}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="w-4 opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500 hover:text-red-500 text-xs"
                    title="Ta bort aktivitet"
                  >
                    ✕
                  </button>
                </div>

                {/* Timeline */}
                <div className="flex relative" style={{ height: "40px" }}>
                  {/* Grid lines */}
                  {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
                    <div
                      key={i}
                      className={`border-r ${(i + 1) % 4 === 0 ? "border-r-gray-300" : "border-r-gray-100"}`}
                      style={{ width: WEEK_WIDTH, height: "100%" }}
                    />
                  ))}

                  {/* Task bar */}
                  {task.isMilestone ? (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1"
                      style={{
                        left: `${(task.startWeek - 1) * WEEK_WIDTH + WEEK_WIDTH / 2 - 12}px`,
                        touchAction: "none",
                      }}
                      onPointerDown={(e) => handleBarPointerDown(e, task, "move")}
                      onPointerMove={handleBarPointerMove}
                      onPointerUp={() => handleBarPointerUp(task)}
                    >
                      <div
                        className={`w-4 h-4 ${task.color} rotate-45`}
                        title={`${task.name} - Vecka ${task.startWeek}. Dra för att flytta, klicka för att redigera.`}
                      />
                    </div>
                  ) : (
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 h-6 ${task.color} rounded cursor-grab active:cursor-grabbing opacity-90 hover:opacity-100 flex items-center justify-center select-none`}
                      style={{
                        left: `${(task.startWeek - 1) * WEEK_WIDTH}px`,
                        width: `${Math.max(task.duration * WEEK_WIDTH, 20)}px`,
                        touchAction: "none",
                      }}
                      title={`${task.name} - Vecka ${task.startWeek}-${task.startWeek + task.duration - 1}. Dra för att flytta, dra i högerkanten för att ändra längd, klicka för att redigera.`}
                      onPointerDown={(e) => handleBarPointerDown(e, task, "move")}
                      onPointerMove={handleBarPointerMove}
                      onPointerUp={() => handleBarPointerUp(task)}
                    >
                      <span className="text-white text-xs font-medium truncate px-1 pointer-events-none">
                        {task.duration > 2 ? task.name : ""}
                      </span>
                      {/* Resize handle on the right edge */}
                      <div
                        className="absolute right-0 top-0 h-full w-2.5 cursor-ew-resize rounded-r bg-black/20"
                        style={{ touchAction: "none" }}
                        onPointerDown={(e) => handleBarPointerDown(e, task, "resize")}
                        onPointerMove={handleBarPointerMove}
                        onPointerUp={() => handleBarPointerUp(task)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add task row */}
            <div className="flex border-b">
              <div className="w-[340px] min-w-[340px] p-2 border-r">
                <Button size="sm" variant="outline" onClick={addTask} className="w-full">
                  + Lägg till aktivitet
                </Button>
              </div>
              <div style={{ width: `${TOTAL_WEEKS * WEEK_WIDTH}px` }} />
            </div>
          </div>
        </div>

        {/* Task editor */}
        {editingTask && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
            <h4 className="font-medium mb-3">Redigera aktivitet</h4>
            {(() => {
              const task = tasks.find(t => t.id === editingTask);
              if (!task) return null;
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Namn</label>
                    <input
                      type="text"
                      value={task.name}
                      onChange={(e) => updateTask(task.id, { name: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Startvecka</label>
                    <input
                      type="number"
                      min={1}
                      max={TOTAL_WEEKS}
                      value={task.startWeek}
                      onChange={(e) => updateTask(task.id, { startWeek: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Längd (veckor)</label>
                    <input
                      type="number"
                      min={0}
                      max={TOTAL_WEEKS}
                      value={task.duration}
                      onChange={(e) => updateTask(task.id, { duration: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Milstolpe</label>
                    <label className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={task.isMilestone || false}
                        onChange={(e) => updateTask(task.id, {
                          isMilestone: e.target.checked,
                          duration: e.target.checked ? 0 : task.duration || 1
                        })}
                        className="rounded"
                      />
                      <span className="text-sm">Är milstolpe</span>
                    </label>
                  </div>
                </div>
              );
            })()}
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => setEditingTask(null)}>Klar</Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 dark:text-red-400"
                onClick={() => {
                  deleteTask(editingTask);
                  setEditingTask(null);
                }}
              >
                Ta bort aktivitet
              </Button>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rotate-45" />
            <span>Milstolpe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-blue-500 rounded" />
            <span>Aktivitet</span>
          </div>
        </div>
      </div>
    </div>
  );
}
