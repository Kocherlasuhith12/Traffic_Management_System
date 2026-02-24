import { TrafficMetrics } from '@/types/traffic';
import { percentImprovement } from '@/utils/calculations';

interface CongestionAnalysisProps {
  metrics: TrafficMetrics;
}

const CongestionAnalysis = ({ metrics }: CongestionAnalysisProps) => {
  const comparisons = [
    {
      label: 'Avg Wait Time',
      fixed: `${metrics.averageWaitTimeFixed}s`,
      adaptive: `${metrics.averageWaitTime}s`,
      improvement: percentImprovement(metrics.averageWaitTimeFixed, metrics.averageWaitTime),
      unit: 's',
    },
    {
      label: 'Queue Length',
      fixed: metrics.queueLengthFixed,
      adaptive: metrics.queueLength,
      improvement: percentImprovement(metrics.queueLengthFixed, metrics.queueLength),
      unit: '',
    },
    {
      label: 'Throughput (veh/min)',
      fixed: metrics.throughputFixed,
      adaptive: metrics.throughput,
      improvement: percentImprovement(metrics.throughputFixed, metrics.throughput),
      unit: '',
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5 animate-fade-in">
      <h3 className="text-sm font-semibold text-foreground mb-4">Fixed vs Adaptive Comparison</h3>
      <div className="space-y-4">
        {comparisons.map(c => (
          <div key={c.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{c.label}</span>
              <span className={c.improvement > 0 ? 'text-primary' : 'text-destructive'}>
                {c.improvement > 0 ? '↑' : '↓'} {Math.abs(c.improvement)}% improvement
              </span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="text-[10px] text-muted-foreground mb-0.5">Fixed</div>
                <div className="h-6 bg-destructive/20 rounded flex items-center px-2">
                  <span className="text-xs font-mono text-destructive">{c.fixed}</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-muted-foreground mb-0.5">Adaptive</div>
                <div className="h-6 bg-primary/20 rounded flex items-center px-2">
                  <span className="text-xs font-mono text-primary">{c.adaptive}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CongestionAnalysis;
