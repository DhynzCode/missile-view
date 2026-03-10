import { useState, useCallback, useRef, useEffect } from "react";
import MapScene, { LaunchStatus } from "@/components/MapScene";

const STATUS_LABELS: Record<LaunchStatus, { text: string; color: string }> = {
  ready: { text: "READY", color: "text-accent" },
  target_locked: { text: "TARGET LOCKED", color: "text-primary" },
  countdown: { text: "COUNTDOWN", color: "text-destructive" },
  launching: { text: "LAUNCHING", color: "text-destructive" },
  in_flight: { text: "IN FLIGHT", color: "text-primary" },
  arrived: { text: "ARRIVED", color: "text-accent" },
};

const LAUNCH_BASE = { lat: 28.5, lng: 77.0 }; // New Delhi area

const Index = () => {
  const [status, setStatus] = useState<LaunchStatus>("ready");
  const [targetCoords, setTargetCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [triggerLaunch, setTriggerLaunch] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const handleTargetSelect = useCallback(
    (lat: number, lng: number) => {
      setTargetCoords({ lat, lng });
      setStatus("target_locked");
      setTriggerLaunch(false);
    },
    []
  );

  const handleLaunch = useCallback(() => {
    if (status !== "target_locked") return;
    setStatus("countdown");
    setCountdown(3);

    let count = 3;
    countdownRef.current = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        setCountdown(null);
        setStatus("launching");
        setTriggerLaunch(true);
        if (countdownRef.current) clearInterval(countdownRef.current);
      }
    }, 1000);
  }, [status]);

  const handleFlightComplete = useCallback(() => {
    setStatus("arrived");
  }, []);

  const handleReset = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setStatus("ready");
    setTargetCoords(null);
    setCountdown(null);
    setTriggerLaunch(false);
  }, []);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const statusInfo = STATUS_LABELS[status];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Map */}
      <div className="absolute inset-0">
        <MapScene
          status={status}
          onTargetSelect={handleTargetSelect}
          onStatusChange={setStatus}
          targetCoords={targetCoords}
          launchCoords={LAUNCH_BASE}
          triggerLaunch={triggerLaunch}
          onFlightComplete={handleFlightComplete}
        />
      </div>

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <span className="text-9xl font-bold font-display text-destructive text-glow-primary animate-pulse">
            {countdown}
          </span>
        </div>
      )}

      {/* Top bar */}
      <header className="pointer-events-none relative z-10 p-4 md:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground font-display">
            Strike Command
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              status === "in_flight" || status === "launching"
                ? "bg-destructive animate-pulse"
                : "bg-accent"
            }`}
          />
          <span className={`text-[10px] tracking-[0.3em] uppercase font-display ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>
      </header>

      {/* Control panel */}
      <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-20 pointer-events-auto">
        <div className="bg-card/90 backdrop-blur-md border border-border rounded-lg p-4 md:p-5 space-y-4 min-w-[240px] md:min-w-[280px] border-glow">
          {/* Title */}
          <div className="flex items-center gap-2">
            <div className="h-px w-4 bg-primary/60" />
            <span className="text-[9px] tracking-[0.4em] uppercase text-primary/80 font-display">
              Launch Control
            </span>
          </div>

          {/* Launch base */}
          <div className="space-y-1.5">
            <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/60">
              Launch Base
            </p>
            <div className="flex gap-4">
              <div>
                <p className="text-[8px] text-muted-foreground/50">LAT</p>
                <p className="text-sm font-display text-foreground font-semibold">
                  {LAUNCH_BASE.lat.toFixed(2)}°
                </p>
              </div>
              <div>
                <p className="text-[8px] text-muted-foreground/50">LNG</p>
                <p className="text-sm font-display text-foreground font-semibold">
                  {LAUNCH_BASE.lng.toFixed(2)}°
                </p>
              </div>
            </div>
          </div>

          {/* Target coordinates */}
          <div className="space-y-1.5">
            <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/60">
              Target Coordinates
            </p>
            {targetCoords ? (
              <div className="flex gap-4">
                <div>
                  <p className="text-[8px] text-muted-foreground/50">LAT</p>
                  <p className="text-sm font-display text-foreground font-semibold">
                    {targetCoords.lat.toFixed(4)}°
                  </p>
                </div>
                <div>
                  <p className="text-[8px] text-muted-foreground/50">LNG</p>
                  <p className="text-sm font-display text-foreground font-semibold">
                    {targetCoords.lng.toFixed(4)}°
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/40 italic">Click map to select target</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-1">
            <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/60">Status</p>
            <p className={`text-xs font-display font-semibold tracking-wider ${statusInfo.color}`}>
              {statusInfo.text}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleLaunch}
              disabled={status !== "target_locked"}
              className="flex-1 px-4 py-2 rounded-md text-[10px] tracking-[0.2em] uppercase font-display font-semibold transition-all
                bg-destructive text-destructive-foreground hover:bg-destructive/80
                disabled:opacity-30 disabled:cursor-not-allowed
                shadow-[0_0_15px_hsl(0_72%_50%/0.3)]"
            >
              Launch
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-md text-[10px] tracking-[0.2em] uppercase font-display font-semibold transition-all
                bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
            >
              Reset
            </button>
          </div>

          {/* Hint */}
          <p className="text-[8px] text-muted-foreground/40 leading-relaxed">
            Click map to set target • Scroll to zoom • Drag to pan
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
