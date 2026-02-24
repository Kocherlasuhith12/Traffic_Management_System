import { TrafficMetrics } from '@/types/traffic';

interface ModelMetricsProps {
  metrics: TrafficMetrics;
}

const ModelMetrics = ({ metrics }: ModelMetricsProps) => {
  const items = [
    { label: 'Congestion Level', value: `${Math.round(metrics.congestionLevel * 100)}%`, bar: metrics.congestionLevel },
    { label: 'Efficiency', value: `${Math.round((1 - metrics.congestionLevel) * 100)}%`, bar: 1 - metrics.congestionLevel },
    { label: 'Adaptive Gain', value: metrics.averageWaitTimeFixed > 0 ? `${Math.round((1 - metrics.averageWaitTime / metrics.averageWaitTimeFixed) * 100)}%` : '—', bar: metrics.averageWaitTimeFixed > 0 ? 1 - metrics.averageWaitTime / metrics.averageWaitTimeFixed : 0 },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5 animate-fade-in">
      <h3 className="text-sm font-semibold text-foreground mb-4">System Metrics</h3>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-mono text-foreground">{item.value}</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.max(0, Math.min(100, item.bar * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelMetrics;
