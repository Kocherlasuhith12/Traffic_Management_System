import { TrafficScenario } from '@/types/traffic';

export const trafficScenarios: TrafficScenario[] = [
  {
    id: 'normal',
    name: 'Normal Traffic',
    description: 'Moderate traffic across all lanes',
    laneConfigs: [
      { laneId: 'lane-N', baseCount: 10, variance: 4 },
      { laneId: 'lane-S', baseCount: 9, variance: 3 },
      { laneId: 'lane-E', baseCount: 11, variance: 5 },
      { laneId: 'lane-W', baseCount: 8, variance: 3 },
    ],
  },
  {
    id: 'rush-hour',
    name: 'Rush Hour',
    description: 'Heavy traffic on main corridors',
    laneConfigs: [
      { laneId: 'lane-N', baseCount: 25, variance: 5 },
      { laneId: 'lane-S', baseCount: 22, variance: 4 },
      { laneId: 'lane-E', baseCount: 18, variance: 6 },
      { laneId: 'lane-W', baseCount: 15, variance: 4 },
    ],
  },
  {
    id: 'imbalanced',
    name: 'Imbalanced Load',
    description: 'One lane dominates traffic',
    laneConfigs: [
      { laneId: 'lane-N', baseCount: 30, variance: 3 },
      { laneId: 'lane-S', baseCount: 5, variance: 2 },
      { laneId: 'lane-E', baseCount: 4, variance: 2 },
      { laneId: 'lane-W', baseCount: 3, variance: 1 },
    ],
  },
  {
    id: 'low-traffic',
    name: 'Low Traffic',
    description: 'Late night minimal traffic',
    laneConfigs: [
      { laneId: 'lane-N', baseCount: 3, variance: 2 },
      { laneId: 'lane-S', baseCount: 2, variance: 1 },
      { laneId: 'lane-E', baseCount: 4, variance: 2 },
      { laneId: 'lane-W', baseCount: 2, variance: 1 },
    ],
  },
];
