import { Intersection, TrafficMetrics, MLPrediction, HistoricalDataPoint } from '@/types/traffic';
import TrafficCharts from './TrafficCharts';
import CongestionAnalysis from './CongestionAnalysis';
import ModelMetrics from './ModelMetrics';
import FeatureImportance from './FeatureImportance';
import MLInsights from './MLInsights';

interface AnalyticsProps {
  intersections: Intersection[];
  metrics: TrafficMetrics[];
  predictions: MLPrediction[];
  historicalData: HistoricalDataPoint[];
}

const Analytics = ({ intersections, metrics, predictions, historicalData }: AnalyticsProps) => {
  return (
    <section className="space-y-6">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Analytics & ML Insights
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficCharts intersections={intersections} historicalData={historicalData} />
        <CongestionAnalysis metrics={metrics[0]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MLInsights predictions={predictions} />
        <ModelMetrics metrics={metrics[0]} />
        <FeatureImportance />
      </div>
    </section>
  );
};

export default Analytics;
