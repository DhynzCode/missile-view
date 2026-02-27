import MissileScene from "@/components/MissileScene";

const Index = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* 3D Canvas - full screen */}
      <div className="absolute inset-0">
        <MissileScene />
      </div>

      {/* Subtle radial gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 80%, hsl(38 95% 55% / 0.04) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, hsl(220 60% 40% / 0.06) 0%, transparent 50%)",
        }}
      />

      {/* Bottom gradient for text readability */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background via-background/20 to-transparent" />

      {/* Top bar */}
      <header className="relative z-10 p-6 md:p-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
            Defense Systems • Live Preview
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {["Overview", "Specs", "Systems"].map((item) => (
            <span
              key={item}
              className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 hover:text-primary transition-colors cursor-pointer"
            >
              {item}
            </span>
          ))}
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex flex-col justify-end min-h-screen p-6 md:p-10 pb-12 md:pb-16">
        <div className="max-w-2xl space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8 bg-primary/60" />
            <span className="text-[10px] tracking-[0.4em] uppercase text-primary/80">
              Series VII
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-foreground leading-[0.9] font-display">
            TRIDENT
            <br />
            <span className="text-primary text-glow-primary">MK-VII</span>
          </h1>

          <p className="text-xs md:text-sm text-muted-foreground max-w-sm leading-relaxed">
            Next-generation guided missile system with quad-fin stabilization,
            advanced aerodynamics, and precision guidance technology.
          </p>

          {/* Stats */}
          <div className="flex gap-8 md:gap-14 pt-3">
            {[
              { label: "RANGE", value: "2,400", unit: "km" },
              { label: "SPEED", value: "Mach", unit: "4.2" },
              { label: "PAYLOAD", value: "450", unit: "kg" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-[9px] tracking-[0.25em] text-muted-foreground/60">
                  {stat.label}
                </p>
                <p className="text-base md:text-lg font-semibold text-foreground font-display">
                  {stat.value}
                  <span className="text-primary/70 ml-1 text-xs">{stat.unit}</span>
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-1">
            <div className="h-px w-12 bg-primary/40" />
            <span className="text-[9px] text-primary/60 tracking-[0.3em]">CLASSIFIED</span>
            <div className="h-px flex-1 bg-border/40" />
          </div>
        </div>
      </div>

      {/* Interaction hint */}
      <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-10 text-right space-y-1">
        <p className="text-[9px] tracking-[0.25em] text-muted-foreground/50 uppercase">
          Drag to rotate • Scroll to zoom
        </p>
      </div>
    </div>
  );
};

export default Index;
