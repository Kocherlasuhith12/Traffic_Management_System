import { TrafficPattern } from '@/data/trafficDetectionDataset';

interface PeakHourAnalysisProps {
  patterns: TrafficPattern[];
  currentPattern: TrafficPattern | null;
}

const PeakHourAnalysis = ({ patterns, currentPattern }: PeakHourAnalysisProps) => {
  const today = new Date().getDay();
  const todayPatterns = patterns.filter(p => p.dayOfWeek === today);
  const peakHours = todayPatterns.filter(p => p.isPeakHour);
  const maxTraffic = Math.max(...todayPatterns.map(p => p.avgVehicles), 1);

  return (
    <div className="rounded-xl border border-border bg-card p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">⏰</span>
        <h3 className="text-sm font-semibold text-foreground">Peak Hour Analysis</h3>
      </div>

      {/* Current status */}
      {currentPattern && (
        <div className={`mb-4 rounded-md px-3 py-2 border ${
          currentPattern.isPeakHour
            ? 'border-destructive/30 bg-destructive/5'
            : 'border-primary/30 bg-primary/5'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground font-medium">
              {currentPattern.isPeakHour ? '🔴 Peak Hour Active' : '🟢 Off-Peak'}
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {new Date().getHours()}:00
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-[10px] text-muted-foreground">
              Expected: <span className="font-mono text-foreground">{currentPattern.avgVehicles}</span> vehicles
            </span>
            <span className="text-[10px] text-muted-foreground">
              Congestion: <span className="font-mono text-foreground">{Math.round(currentPattern.congestionProbability * 100)}%</span>
            </span>
          </div>
        </div>
      )}

      {/* Hourly heatmap */}
      <div className="mb-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">24h Traffic Heatmap</p>
        <div className="flex gap-0.5">
          {todayPatterns.map(p => {
            const intensity = p.avgVehicles / maxTraffic;
            const hour = p.hour;
            return (
              <div
                key={hour}
                className="flex-1 rounded-sm relative group cursor-default"
                style={{
                  height: '24px',
                  backgroundColor: `hsl(${142 - intensity * 142}, ${60 + intensity * 20}%, ${45 - intensity * 20}%)`,
                  opacity: 0.4 + intensity * 0.6,
                }}
                title={`${hour}:00 — ${p.avgVehicles} vehicles`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-muted-foreground">0:00</span>
          <span className="text-[9px] text-muted-foreground">6:00</span>
          <span className="text-[9px] text-muted-foreground">12:00</span>
          <span className="text-[9px] text-muted-foreground">18:00</span>
          <span className="text-[9px] text-muted-foreground">23:00</span>
        </div>
      </div>

      {/* Peak hours list */}
      <div className="space-y-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Peak Hours Today</p>
        {peakHours.length > 0 ? peakHours.map(p => (
          <div key={p.hour} className="flex items-center justify-between text-xs py-0.5">
            <span className="text-foreground font-mono">{p.hour}:00 – {p.hour + 1}:00</span>
            <span className="text-accent font-mono">{p.avgVehicles} avg</span>
          </div>
        )) : (
          <p className="text-xs text-muted-foreground">No peak hours today (weekend)</p>
        )}
      </div>
    </div>
  );
};

export default PeakHourAnalysis;
