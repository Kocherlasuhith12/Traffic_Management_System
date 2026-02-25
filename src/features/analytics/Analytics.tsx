import { Intersection, TrafficMetrics, MLPrediction, HistoricalDataPoint } from '@/types/traffic';
import { DetectionEvent, AnomalyRecord, TrafficPattern, VehicleType } from '@/data/trafficDetectionDataset';
import TrafficCharts from './TrafficCharts';
import CongestionAnalysis from './CongestionAnalysis';
import ModelMetrics from './ModelMetrics';
import FeatureImportance from './FeatureImportance';
import MLInsights from './MLInsights';
import TrafficDetectionFeed from './TrafficDetectionFeed';
import VehicleClassification from './VehicleClassification';
import PeakHourAnalysis from './PeakHourAnalysis';
import EmergencyPriority from './EmergencyPriority';

interface AnalyticsProps {
  intersections: Intersection[];
  metrics: TrafficMetrics[];
  predictions: MLPrediction[];
  historicalData: HistoricalDataPoint[];
  detections: DetectionEvent[];
  anomalies: AnomalyRecord[];
  trafficPatterns: TrafficPattern[];
  vehicleDistribution: Record<VehicleType, number>;
  averageSpeed: number;
  currentPattern: TrafficPattern | null;
  emergencyActive: boolean;
  emergencyLane: string | null;
}

const Analytics = ({
  intersections, metrics, predictions, historicalData,
  detections, anomalies, trafficPatterns, vehicleDistribution,
  averageSpeed, currentPattern, emergencyActive, emergencyLane,
}: AnalyticsProps) => {
  return (
    <section className="space-y-6">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Analytics & ML Insights
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficCharts intersections={intersections} historicalData={historicalData} />
        <CongestionAnalysis metrics={metrics[0]} />
      </div>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Traffic Detection & Classification
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficDetectionFeed detections={detections} anomalies={anomalies} />
        <VehicleClassification distribution={vehicleDistribution} averageSpeed={averageSpeed} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MLInsights predictions={predictions} />
        <PeakHourAnalysis patterns={trafficPatterns} currentPattern={currentPattern} />
        <EmergencyPriority anomalies={anomalies} emergencyActive={emergencyActive} emergencyLane={emergencyLane} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModelMetrics metrics={metrics[0]} />
        <FeatureImportance />
      </div>
    </section>
  );
};

export default Analytics;
