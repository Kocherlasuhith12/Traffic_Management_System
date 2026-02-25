// ─── Traffic Detection Dataset ───
// Simulated CCTV/sensor detection data for ML training and real-time display.

export type VehicleType = 'car' | 'truck' | 'bus' | 'motorcycle' | 'bicycle' | 'emergency';

export interface DetectionEvent {
  id: string;
  timestamp: number;
  laneId: string;
  vehicleType: VehicleType;
  speed: number; // km/h
  confidence: number; // 0-1 detection confidence
  isAnomaly: boolean;
  boundingBox: { x: number; y: number; w: number; h: number };
}

export interface TrafficPattern {
  hour: number;
  dayOfWeek: number; // 0=Sun, 6=Sat
  avgVehicles: number;
  avgSpeed: number;
  dominantType: VehicleType;
  congestionProbability: number;
  isPeakHour: boolean;
}

export interface AnomalyRecord {
  id: string;
  timestamp: number;
  laneId: string;
  type: 'wrong_way' | 'stopped_vehicle' | 'overspeeding' | 'emergency_vehicle' | 'sudden_congestion' | 'accident_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  resolved: boolean;
}

const VEHICLE_TYPES: VehicleType[] = ['car', 'car', 'car', 'car', 'truck', 'bus', 'motorcycle', 'bicycle'];
const LANES = ['lane-N', 'lane-S', 'lane-E', 'lane-W'];

let detectionIdCounter = 0;
let anomalyIdCounter = 0;

/**
 * Generate a batch of simulated detection events (as if from CCTV/YOLO).
 */
export const generateDetectionBatch = (laneId: string, vehicleCount: number): DetectionEvent[] => {
  const events: DetectionEvent[] = [];
  const now = Date.now();

  for (let i = 0; i < vehicleCount; i++) {
    const isEmergency = Math.random() < 0.02;
    const vehicleType: VehicleType = isEmergency ? 'emergency' : VEHICLE_TYPES[Math.floor(Math.random() * VEHICLE_TYPES.length)];
    const baseSpeed = vehicleType === 'truck' ? 30 : vehicleType === 'bus' ? 25 : vehicleType === 'motorcycle' ? 45 : 35;

    events.push({
      id: `det-${++detectionIdCounter}`,
      timestamp: now - Math.floor(Math.random() * 5000),
      laneId,
      vehicleType,
      speed: Math.max(0, baseSpeed + Math.floor(Math.random() * 20 - 10)),
      confidence: 0.75 + Math.random() * 0.25,
      isAnomaly: Math.random() < 0.03,
      boundingBox: {
        x: Math.floor(Math.random() * 800),
        y: Math.floor(Math.random() * 600),
        w: vehicleType === 'truck' || vehicleType === 'bus' ? 120 : 80,
        h: vehicleType === 'truck' || vehicleType === 'bus' ? 60 : 40,
      },
    });
  }

  return events;
};

/**
 * Generate historical traffic patterns for pattern recognition.
 */
export const generateTrafficPatterns = (): TrafficPattern[] => {
  const patterns: TrafficPattern[] = [];

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
      const isWeekend = day === 0 || day === 6;
      const baseFactor = isWeekend ? 0.6 : 1;
      const peakFactor = isPeak ? 1.8 : 1;
      const nightFactor = (hour >= 22 || hour <= 5) ? 0.3 : 1;

      const avgVehicles = Math.round(15 * baseFactor * peakFactor * nightFactor + Math.random() * 5);
      const avgSpeed = Math.round(40 - avgVehicles * 0.8 + Math.random() * 10);

      patterns.push({
        hour,
        dayOfWeek: day,
        avgVehicles,
        avgSpeed: Math.max(5, avgSpeed),
        dominantType: avgVehicles > 20 ? 'car' : Math.random() > 0.7 ? 'truck' : 'car',
        congestionProbability: Math.min(1, avgVehicles / 35),
        isPeakHour: isPeak && !isWeekend,
      });
    }
  }

  return patterns;
};

/**
 * Check for anomalies in current detection data.
 */
export const detectAnomalies = (detections: DetectionEvent[], laneId: string): AnomalyRecord[] => {
  const anomalies: AnomalyRecord[] = [];
  const now = Date.now();

  // Emergency vehicle detection
  const emergencies = detections.filter(d => d.vehicleType === 'emergency');
  if (emergencies.length > 0) {
    anomalies.push({
      id: `anom-${++anomalyIdCounter}`,
      timestamp: now,
      laneId,
      type: 'emergency_vehicle',
      severity: 'critical',
      description: `Emergency vehicle detected on ${laneId}. Priority signal recommended.`,
      resolved: false,
    });
  }

  // Overspeeding
  const speeders = detections.filter(d => d.speed > 55);
  if (speeders.length > 0) {
    anomalies.push({
      id: `anom-${++anomalyIdCounter}`,
      timestamp: now,
      laneId,
      type: 'overspeeding',
      severity: 'medium',
      description: `${speeders.length} vehicle(s) exceeding speed limit on ${laneId}.`,
      resolved: false,
    });
  }

  // Sudden congestion (too many vehicles)
  if (detections.length > 25) {
    anomalies.push({
      id: `anom-${++anomalyIdCounter}`,
      timestamp: now,
      laneId,
      type: 'sudden_congestion',
      severity: 'high',
      description: `Sudden congestion spike: ${detections.length} vehicles on ${laneId}.`,
      resolved: false,
    });
  }

  // Stopped vehicle
  const stopped = detections.filter(d => d.speed < 3);
  if (stopped.length >= 2) {
    anomalies.push({
      id: `anom-${++anomalyIdCounter}`,
      timestamp: now,
      laneId,
      type: 'stopped_vehicle',
      severity: 'medium',
      description: `${stopped.length} stopped vehicle(s) detected on ${laneId}. Possible breakdown.`,
      resolved: false,
    });
  }

  return anomalies;
};

/**
 * Get vehicle type distribution from detections.
 */
export const getVehicleTypeDistribution = (detections: DetectionEvent[]): Record<VehicleType, number> => {
  const dist: Record<VehicleType, number> = { car: 0, truck: 0, bus: 0, motorcycle: 0, bicycle: 0, emergency: 0 };
  detections.forEach(d => { dist[d.vehicleType]++; });
  return dist;
};

/**
 * Calculate average speed from detections.
 */
export const getAverageSpeed = (detections: DetectionEvent[]): number => {
  if (detections.length === 0) return 0;
  return Math.round(detections.reduce((s, d) => s + d.speed, 0) / detections.length);
};

/**
 * Get current hour traffic pattern prediction.
 */
export const getCurrentPatternPrediction = (patterns: TrafficPattern[]): TrafficPattern | null => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  return patterns.find(p => p.hour === hour && p.dayOfWeek === day) || null;
};
