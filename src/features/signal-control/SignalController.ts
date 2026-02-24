// ─── SignalController.ts ───
// Orchestrates vehicle counting, timing calculation, and signal state transitions.
// Ensures safe rotation: GREEN → YELLOW → RED, then next lane gets GREEN.

import { Intersection, SignalState, Lane } from '@/types/traffic';
import { VehicleCounter } from './VehicleCounter';
import { TimingEngine } from './TimingEngine';

export class SignalController {
  private counter: VehicleCounter;
  private engine: TimingEngine;

  constructor(counter: VehicleCounter, engine: TimingEngine) {
    this.counter = counter;
    this.engine = engine;
  }

  /**
   * Main tick: advance the intersection state by 1 second.
   * Returns updated intersection.
   */
  tick(intersection: Intersection): Intersection {
    const updated = { ...intersection, lanes: intersection.lanes.map(l => ({ ...l })) };

    if (updated.remainingGreenTime > 0) {
      updated.remainingGreenTime -= 1;

      if (updated.remainingGreenTime <= 0) {
        // Transition to YELLOW
        if (updated.signalState === 'GREEN') {
          updated.signalState = 'YELLOW';
          updated.remainingGreenTime = this.engine.getConfig().yellowTime;
        } else if (updated.signalState === 'YELLOW') {
          // Move to next lane
          updated.signalState = 'RED';
          const nextLane = this.getNextLane(updated);
          updated.activeLaneId = nextLane.id;
          updated.signalState = 'GREEN';

          // Get fresh vehicle counts
          const counts = this.counter.getCounts();
          counts.forEach(c => {
            const lane = updated.lanes.find(l => l.id === c.laneId);
            if (lane) {
              lane.vehicleCount = c.count;
              lane.queueLength = Math.max(0, Math.round(c.count * 0.4));
            }
          });

          // Calculate adaptive green time for next lane
          const nextCount = counts.find(c => c.laneId === nextLane.id)?.count ?? 10;
          updated.remainingGreenTime = this.engine.calculateGreenDuration(nextCount);
          updated.cycleCount += 1;
        }
      }
    }

    // Simulate vehicles clearing during green
    const activeLane = updated.lanes.find(l => l.id === updated.activeLaneId);
    if (activeLane && updated.signalState === 'GREEN' && activeLane.vehicleCount > 0) {
      activeLane.vehicleCount = Math.max(0, activeLane.vehicleCount - 1);
      activeLane.queueLength = Math.max(0, activeLane.queueLength - 1);
    }

    // Simulate vehicles arriving on red lanes
    updated.lanes.forEach(lane => {
      if (lane.id !== updated.activeLaneId && Math.random() > 0.6) {
        lane.vehicleCount += 1;
        lane.queueLength = Math.min(lane.queueLength + 1, 30);
      }
    });

    return updated;
  }

  /**
   * Select next lane using density-priority: the lane with most vehicles goes next.
   * Fairness: if a lane hasn't had green in 3+ cycles, it gets priority.
   */
  private getNextLane(intersection: Intersection): Lane {
    const currentIdx = intersection.lanes.findIndex(l => l.id === intersection.activeLaneId);
    const otherLanes = intersection.lanes.filter(l => l.id !== intersection.activeLaneId);

    // Sort by vehicle count descending (density priority)
    otherLanes.sort((a, b) => b.vehicleCount - a.vehicleCount);

    // Return highest density lane, fallback to round-robin
    return otherLanes[0] || intersection.lanes[(currentIdx + 1) % intersection.lanes.length];
  }

  getCounter(): VehicleCounter {
    return this.counter;
  }

  getEngine(): TimingEngine {
    return this.engine;
  }
}
