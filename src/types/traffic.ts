// ─── Core Traffic Types ───

export type SignalState = 'RED' | 'YELLOW' | 'GREEN';

export interface Lane {
  id: string;
  name: string;
  direction: 'N' | 'S' | 'E' | 'W';
  vehicleCount: number;
  queueLength: number;
}

export interface Intersection {
  id: string;
  name: string;
  lanes: Lane[];
  activeLaneId: string;
  signalState: SignalState;
  remainingGreenTime: number;
  cycleCount: number;
}

export interface SignalTiming {
  laneId: string;
  greenDuration: number;
  yellowDuration: number;
  isAdaptive: boolean;
  densityFactor: number;
}

export interface TrafficMetrics {
  averageWaitTime: number;
  averageWaitTimeFixed: number;
  throughput: number;
  throughputFixed: number;
  queueLength: number;
  queueLengthFixed: number;
  congestionLevel: number;
}

export interface VehicleCountEntry {
  laneId: string;
  laneName: string;
  count: number;
  timestamp: number;
}

export interface MLPrediction {
  laneId: string;
  predictedCount: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendedAdjustment: number; // seconds to add/subtract
}

export interface HistoricalDataPoint {
  timestamp: number;
  laneId: string;
  vehicleCount: number;
  waitTime: number;
  greenDuration: number;
}

export interface TrafficScenario {
  id: string;
  name: string;
  description: string;
  laneConfigs: { laneId: string; baseCount: number; variance: number }[];
}
