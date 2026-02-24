import { Intersection, Lane, HistoricalDataPoint } from '@/types/traffic';

export const createDefaultLanes = (): Lane[] => [
  { id: 'lane-N', name: 'North Lane', direction: 'N', vehicleCount: 12, queueLength: 5 },
  { id: 'lane-S', name: 'South Lane', direction: 'S', vehicleCount: 8, queueLength: 3 },
  { id: 'lane-E', name: 'East Lane', direction: 'E', vehicleCount: 18, queueLength: 8 },
  { id: 'lane-W', name: 'West Lane', direction: 'W', vehicleCount: 5, queueLength: 2 },
];

export const createDefaultIntersections = (): Intersection[] => [
  {
    id: 'int-1',
    name: 'Main St & 1st Ave',
    lanes: createDefaultLanes(),
    activeLaneId: 'lane-N',
    signalState: 'GREEN',
    remainingGreenTime: 30,
    cycleCount: 0,
  },
  {
    id: 'int-2',
    name: 'Broadway & Oak Dr',
    lanes: [
      { id: 'lane-N2', name: 'North Lane', direction: 'N', vehicleCount: 15, queueLength: 6 },
      { id: 'lane-S2', name: 'South Lane', direction: 'S', vehicleCount: 10, queueLength: 4 },
      { id: 'lane-E2', name: 'East Lane', direction: 'E', vehicleCount: 7, queueLength: 3 },
      { id: 'lane-W2', name: 'West Lane', direction: 'W', vehicleCount: 22, queueLength: 10 },
    ],
    activeLaneId: 'lane-N2',
    signalState: 'GREEN',
    remainingGreenTime: 25,
    cycleCount: 0,
  },
];

export const generateHistoricalData = (): HistoricalDataPoint[] => {
  const data: HistoricalDataPoint[] = [];
  const lanes = ['lane-N', 'lane-S', 'lane-E', 'lane-W'];
  const now = Date.now();

  for (let i = 60; i >= 0; i--) {
    lanes.forEach(laneId => {
      const hour = new Date(now - i * 60000).getHours();
      const rushHourFactor = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 1.8 : 1;
      const base = 8 + Math.random() * 15;
      data.push({
        timestamp: now - i * 60000,
        laneId,
        vehicleCount: Math.round(base * rushHourFactor),
        waitTime: Math.round(20 + Math.random() * 40 * rushHourFactor),
        greenDuration: Math.round(15 + base * rushHourFactor),
      });
    });
  }
  return data;
};
