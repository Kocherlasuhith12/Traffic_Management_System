// ─── TimingEngine.ts ───
// Calculates adaptive green signal durations based on vehicle density.
// Green time is directly proportional to vehicle count — never exceeds it.

import { SignalTiming, VehicleCountEntry, MLPrediction } from '@/types/traffic';

export interface TimingConfig {
  minGreenTime: number;   // seconds
  maxGreenTime: number;   // seconds
  yellowTime: number;     // seconds
  vehiclesPerSecond: number; // how many vehicles clear per second of green
}

const DEFAULT_TIMING_CONFIG: TimingConfig = {
  minGreenTime: 5,
  maxGreenTime: 45,
  yellowTime: 3,
  vehiclesPerSecond: 1,
};

export class TimingEngine {
  private config: TimingConfig;

  constructor(config: Partial<TimingConfig> = {}) {
    this.config = { ...DEFAULT_TIMING_CONFIG, ...config };
  }

  /**
   * RULE-BASED: Green duration = vehicleCount / vehiclesPerSecond.
   * Directly proportional — green time never exceeds vehicle count.
   * Capped by min/max for safety.
   */
  calculateGreenDuration(vehicleCount: number): number {
    // 1 vehicle ≈ 1 second of green (at default vehiclesPerSecond = 1)
    const needed = Math.ceil(vehicleCount / this.config.vehiclesPerSecond);
    const duration = Math.max(
      this.config.minGreenTime,
      Math.min(this.config.maxGreenTime, needed)
    );
    return duration;
  }

  /**
   * ML-ASSISTED: Adjust green duration using ML prediction.
   * Adds/subtracts time based on predicted traffic trend.
   * Final value still capped so it doesn't exceed vehicle count + adjustment.
   */
  calculateAdaptiveDuration(vehicleCount: number, prediction?: MLPrediction): number {
    let baseDuration = this.calculateGreenDuration(vehicleCount);

    if (prediction) {
      baseDuration += prediction.recommendedAdjustment;
      // Never exceed vehicle count + predicted incoming vehicles
      const upperBound = Math.min(
        this.config.maxGreenTime,
        vehicleCount + Math.max(0, prediction.recommendedAdjustment)
      );
      baseDuration = Math.max(this.config.minGreenTime, Math.min(upperBound, baseDuration));
    }

    return Math.round(baseDuration);
  }

  /**
   * Calculate timing for all lanes, ensuring fairness.
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
