import MissileScene from "@/components/MissileScene";

const Index = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* 3D Canvas - full screen background */}
      <div className="absolute inset-0">
        <MissileScene />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background via-transparent to-background/40" />

      {/* Top-left header */}
      <header className="relative z-10 p-6 md:p-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-medium">
            Defense Systems
          </span>
        </div>
      </header>

      {/* Main content overlay */}
      <div className="relative z-10 flex flex-col justify-end min-h-screen p-6 md:p-10 pb-16 md:pb-20">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground text-glow-primary leading-[0.95]">
            TRIDENT
            <br />
            <span className="text-primary">MK-VII</span>
          </h1>

          <p className="text-sm md:text-base text-muted-foreground max-w-md leading-relaxed">
            Next-generation guided missile system featuring advanced aerodynamic
            design with quad-fin stabilization and precision guidance technology.
          </p>

          {/* Stats row */}
          <div className="flex gap-8 md:gap-12 pt-4">
            {[
              { label: "RANGE", value: "2,400 km" },
              { label: "SPEED", value: "Mach 4.2" },
              { label: "PAYLOAD", value: "450 kg" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-xs tracking-[0.2em] text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-lg md:text-xl font-semibold text-foreground font-['Orbitron']">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Decorative line */}
          <div className="flex items-center gap-4 pt-2">
            <div className="h-px w-16 bg-primary/50" />
            <span className="text-xs text-primary tracking-widest">CLASSIFIED</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>
      </div>

      {/* Bottom-right corner info */}
      <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-10 text-right">
        <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          Interactive 3D Model
        </p>
        <p className="text-[10px] tracking-[0.2em] text-muted-foreground/50 mt-1">
          Rotate • Observe • Analyze
        </p>
      </div>
    </div>
  );
};

export default Index;
