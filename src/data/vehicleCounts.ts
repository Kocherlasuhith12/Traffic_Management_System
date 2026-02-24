import { VehicleCountEntry } from '@/types/traffic';

// Simulates vehicle count updates with some variance
export const generateVehicleCounts = (baseCounts: Record<string, number>): VehicleCountEntry[] => {
  const names: Record<string, string> = {
    'lane-N': 'North Lane',
    'lane-S': 'South Lane',
    'lane-E': 'East Lane',
    'lane-W': 'West Lane',
    'lane-N2': 'North Lane',
    'lane-S2': 'South Lane',
    'lane-E2': 'East Lane',
    'lane-W2': 'West Lane',
  };

  return Object.entries(baseCounts).map(([laneId, base]) => ({
    laneId,
    laneName: names[laneId] || laneId,
    count: Math.max(0, base + Math.floor(Math.random() * 7 - 3)),
    timestamp: Date.now(),
  }));
};

export const initialVehicleCounts: Record<string, number> = {
  'lane-N': 12,
  'lane-S': 8,
  'lane-E': 18,
  'lane-W': 5,
};

export const initialVehicleCounts2: Record<string, number> = {
  'lane-N2': 15,
  'lane-S2': 10,
  'lane-E2': 7,
  'lane-W2': 22,
};
