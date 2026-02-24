import { Intersection } from '@/types/traffic';
import { formatCountdown } from '@/utils/calculations';

interface TrafficMapProps {
  intersections: Intersection[];
}

const SignalLight = ({ state, active }: { state: string; active: boolean }) => {
  const getClass = (color: string) => {
    if (!active) return 'signal-light signal-off';
    if (state === color) {
      if (color === 'GREEN') return 'signal-light signal-green pulse-dot';
      if (color === 'YELLOW') return 'signal-light signal-yellow';
      if (color === 'RED') return 'signal-light signal-red';
    }
    return 'signal-light signal-off';
  };

  return (
    <div className="flex flex-col gap-1.5 bg-secondary/50 rounded-lg p-2 items-center">
      <div className={getClass('RED')} />
      <div className={getClass('YELLOW')} />
      <div className={getClass('GREEN')} />
    </div>
  );
};

const LaneCard = ({
  lane,
  isActive,
  signalState,
  remainingTime,
}: {
  lane: Intersection['lanes'][0];
  isActive: boolean;
  signalState: string;
  remainingTime: number;
}) => {
  const directionIcons: Record<string, string> = { N: '↑', S: '↓', E: '→', W: '←' };

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
        isActive
          ? 'border-primary/40 bg-primary/5'
          : 'border-border bg-card'
      }`}
    >
      <SignalLight state={isActive ? signalState : 'RED'} active={true} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{directionIcons[lane.direction] || '•'}</span>
          <span className="text-sm font-medium text-foreground">{lane.name}</span>
        </div>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-xs text-muted-foreground">
            🚗 <span className="font-mono font-semibold text-foreground">{lane.vehicleCount}</span> vehicles
          </span>
          <span className="text-xs text-muted-foreground">
            📊 Queue: <span className="font-mono">{lane.queueLength}</span>
          </span>
        </div>
      </div>
      {isActive && (
        <div className="text-right">
          <div className="countdown-text text-primary">{formatCountdown(remainingTime)}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">remaining</div>
        </div>
      )}
    </div>
  );
};

const TrafficMap = ({ intersections }: TrafficMapProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {intersections.map(intersection => (
        <div key={intersection.id} className="rounded-xl border border-border bg-card p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">{intersection.name}</h3>
            <span className="text-xs font-mono text-muted-foreground">
              Cycle #{intersection.cycleCount}
            </span>
          </div>
          <div className="space-y-2">
            {intersection.lanes.map(lane => (
              <LaneCard
                key={lane.id}
                lane={lane}
                isActive={lane.id === intersection.activeLaneId}
                signalState={intersection.signalState}
                remainingTime={intersection.remainingGreenTime}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrafficMap;
