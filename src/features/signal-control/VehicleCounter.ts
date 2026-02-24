// ─── VehicleCounter.ts ───
// Responsible for counting vehicles per lane using simulation data.
// Designed for future integration with CCTV / sensor feeds.

import { VehicleCountEntry } from '@/types/traffic';

export interface VehicleCounterConfig {
  updateIntervalMs: number;
  noiseLevel: number; // 0-1, amount of random variance
}

const DEFAULT_CONFIG: VehicleCounterConfig = {
  updateIntervalMs: 2000,
  noiseLevel: 0.2,
};

/**
 * Simulates vehicle counting for a set of lanes.
 * In production, this would interface with CCTV or sensor APIs.
 */
export class VehicleCounter {
  private baseCounts: Record<string, number>;
  private config: VehicleCounterConfig;
  private history: VehicleCountEntry[][] = [];

  constructor(baseCounts: Record<string, number>, config: Partial<VehicleCounterConfig> = {}) {
    this.baseCounts = { ...baseCounts };
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get current vehicle counts with simulated variance.
   * Returns: { laneId, vehicleCount }[] 
   */
  getCounts(): VehicleCountEntry[] {
    const counts = Object.entries(this.baseCounts).map(([laneId, base]) => {
      const noise = Math.floor((Math.random() * 2 - 1) * base * this.config.noiseLevel);
      const count = Math.max(0, base + noise);
      return {
        laneId,
        laneName: this.getLaneName(laneId),
        count,
        timestamp: Date.now(),
      };
    });
    this.history.push(counts);
    if (this.history.length > 30) this.history.shift();
    return counts;
  }

  /**
   * Update base count for a lane (simulates real-time change).
   */
  updateBaseCount(laneId: string, count: number): void {
    this.baseCounts[laneId] = Math.max(0, count);
  }

  /**
   * Get historical counts for ML predictions.
   */
  getHistory(): VehicleCountEntry[][] {
    return [...this.history];
  }

  /**
   * Get the count for a specific lane.
   */
  getLaneCount(laneId: string): number {
    const latest = this.getCounts();
    return latest.find(c => c.laneId === laneId)?.count ?? 0;
  }

  private getLaneName(laneId: string): string {
    const names: Record<string, string> = {
      'lane-N': 'North Lane', 'lane-S': 'South Lane',
      'lane-E': 'East Lane', 'lane-W': 'West Lane',
      'lane-N2': 'North Lane', 'lane-S2': 'South Lane',
      'lane-E2': 'East Lane', 'lane-W2': 'West Lane',
    };
    return names[laneId] || laneId;
  }
}
