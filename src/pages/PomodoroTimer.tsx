import { useState, useEffect, useCallback, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw, Coffee, Timer, Check } from "lucide-react";
import { toast } from "sonner";

const PomodoroTimer = () => {
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [taskName, setTaskName] = useState("");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Switch mode
          if (!isBreak) {
            setSessions((s) => s + 1);
            toast.success("Work session complete! Time for a break.");
            setIsBreak(true);
            return breakMin * 60;
          } else {
            toast.info("Break's over! Back to work.");
            setIsBreak(false);
            return workMin * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, isBreak, workMin, breakMin]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const reset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workMin * 60);
  };

  const progress = isBreak
    ? ((breakMin * 60 - timeLeft) / (breakMin * 60)) * 100
    : ((workMin * 60 - timeLeft) / (workMin * 60)) * 100;

  return (
    <ToolLayout title="Pomodoro Timer" toolName="pomodoro-timer">
      <div className="max-w-md mx-auto p-6 space-y-8 flex flex-col items-center">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-display font-semibold text-foreground">Pomodoro Timer</h2>
          <p className="text-sm text-muted-foreground">Stay focused with timed work & break sessions.</p>
        </div>

        {/* Timer display */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" strokeWidth="3" className="stroke-border" />
            <circle
              cx="50" cy="50" r="45" fill="none" strokeWidth="3"
              className={isBreak ? "stroke-accent" : "stroke-primary"}
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="text-center z-10">
            <div className="text-5xl font-display font-bold text-foreground tracking-tight">
              {formatTime(timeLeft)}
            </div>
            <div className={`text-xs font-display uppercase tracking-wider mt-1 ${isBreak ? "text-accent" : "text-primary"}`}>
              {isBreak ? "Break" : "Focus"}
            </div>
          </div>
        </div>

        {/* Task name */}
        <Input
          placeholder="What are you working on?"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className="text-center max-w-xs"
        />

        {/* Controls */}
        <div className="flex gap-3">
          <Button variant="outline" size="icon" onClick={reset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button size="lg" onClick={() => setIsRunning(!isRunning)} className="px-8">
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
        </div>

        {/* Settings */}
        <div className="flex gap-4 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Work (min)</Label>
            <Input type="number" value={workMin} onChange={(e) => { setWorkMin(Number(e.target.value)); if (!isRunning) setTimeLeft(Number(e.target.value) * 60); }} min={1} max={120} className="w-20" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Break (min)</Label>
            <Input type="number" value={breakMin} onChange={(e) => setBreakMin(Number(e.target.value))} min={1} max={60} className="w-20" />
          </div>
        </div>

        {/* Session counter */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="w-4 h-4" />
          {sessions} session{sessions !== 1 ? "s" : ""} completed
          {sessions > 0 && <span className="text-xs">({sessions * workMin} min focused)</span>}
        </div>
      </div>
    </ToolLayout>
  );
};

export default PomodoroTimer;
