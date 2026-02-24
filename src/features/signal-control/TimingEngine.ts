// ─── TimingEngine.ts ───
// Calculates adaptive green signal durations based on vehicle density.
// Ensures fairness and prevents starvation.

import { SignalTiming, VehicleCountEntry, MLPrediction } from '@/types/traffic';

export interface TimingConfig {
  minGreenTime: number;   // seconds
  maxGreenTime: number;   // seconds
  yellowTime: number;     // seconds
  baseGreenTime: number;  // seconds (used when count is moderate)
  vehiclesPerSecond: number; // how many vehicles clear per second of green
}

const DEFAULT_TIMING_CONFIG: TimingConfig = {
  minGreenTime: 10,
  maxGreenTime: 60,
  yellowTime: 3,
  baseGreenTime: 20,
  vehiclesPerSecond: 0.5,
};

export class TimingEngine {
  private config: TimingConfig;

  constructor(config: Partial<TimingConfig> = {}) {
    this.config = { ...DEFAULT_TIMING_CONFIG, ...config };
  }

  /**
   * RULE-BASED: Calculate green duration proportional to vehicle count.
   * Higher density → longer green, capped by min/max.
   */
  calculateGreenDuration(vehicleCount: number): number {
    const needed = vehicleCount / this.config.vehiclesPerSecond;
    const duration = Math.max(
      this.config.minGreenTime,
      Math.min(this.config.maxGreenTime, this.config.baseGreenTime + needed * 0.5)
    );
    return Math.round(duration);
  }

  /**
   * ML-ASSISTED: Adjust green duration using ML prediction.
   * Adds/subtracts time based on predicted traffic trend.
   */
  calculateAdaptiveDuration(vehicleCount: number, prediction?: MLPrediction): number {
    let baseDuration = this.calculateGreenDuration(vehicleCount);

    if (prediction) {
      // ML adjustment: if traffic is predicted to increase, proactively extend green
      baseDuration += prediction.recommendedAdjustment;
      baseDuration = Math.max(this.config.minGreenTime, Math.min(this.config.maxGreenTime, baseDuration));
    }

    return Math.round(baseDuration);
  }

  /**
   * Calculate timing for all lanes, ensuring fairness.
   * Distributes green time proportionally but guarantees minimum for all.
   */
  calculateAllTimings(counts: VehicleCountEntry[], predictions?: MLPrediction[]): SignalTiming[] {
    const totalVehicles = counts.reduce((sum, c) => sum + c.count, 0);

    return counts.map(entry => {
      const prediction = predictions?.find(p => p.laneId === entry.laneId);
      const greenDuration = this.calculateAdaptiveDuration(entry.count, prediction);
      const densityFactor = totalVehicles > 0 ? entry.count / totalVehicles : 1 / counts.length;

      return {
        laneId: entry.laneId,
        greenDuration,
        yellowDuration: this.config.yellowTime,
        isAdaptive: true,
        densityFactor: Math.round(densityFactor * 100) / 100,
      };
    });
  }

  getConfig(): TimingConfig {
    return { ...this.config };
  }
}
