// ─── SignalController.ts ───
// Orchestrates vehicle counting, timing calculation, and signal state transitions.
// Implements a deterministic signal state machine with cycle locking.
// Timing updates are NEVER applied mid-cycle — only at cycle boundaries.

import { Intersection, SignalState, Lane, SpeedCategory } from '@/types/traffic';
import { VehicleCounter } from './VehicleCounter';
import { TimingEngine } from './TimingEngine';

export class SignalController {
  private counter: VehicleCounter;
  private engine: TimingEngine;

  // Emergency override is QUEUED, not applied mid-cycle
  private pendingEmergencyLane: string | null = null;
  private emergencyActive = false;

  // Cycle lock: prevents ANY state change during an active GREEN or YELLOW phase
  private cycleLocked = false;

  constructor(counter: VehicleCounter, engine: TimingEngine) {
    this.counter = counter;
    this.engine = engine;
  }

  /**
   * Main tick: advance the intersection state by 1 second.
   *
   * STATE MACHINE:
   *   GREEN (countdown) → YELLOW (3s) → RED (instantaneous) → next lane GREEN
   *
   * INVARIANTS:
   *   1. Once GREEN starts, remainingGreenTime counts to 0 without interruption
   *   2. Vehicle count / speed updates do NOT reset the countdown
   *   3. Emergency overrides are queued and applied at the next cycle boundary
   *   4. Timing for the NEXT lane is calculated at the boundary, not during execution
   */
  tick(intersection: Intersection): Intersection {
    const updated: Intersection = {
      ...intersection,
      lanes: intersection.lanes.map(l => ({ ...l })),
    };

    // ── Phase 1: Countdown ──
    // Signal is locked during GREEN and YELLOW — just decrement
    if (updated.remainingGreenTime > 0) {
      updated.remainingGreenTime -= 1;
      this.cycleLocked = true;

      // ── Phase 2: State transitions (only when countdown reaches 0) ──
      if (updated.remainingGreenTime <= 0) {
        if (updated.signalState === 'GREEN') {
          // GREEN → YELLOW transition
          updated.signalState = 'YELLOW';
          updated.remainingGreenTime = this.engine.getConfig().yellowTime;
          // Still locked during YELLOW
        } else if (updated.signalState === 'YELLOW') {
          // YELLOW → RED → next lane GREEN
          // Cycle is now COMPLETE — unlock
          this.cycleLocked = false;
          updated.signalState = 'RED';

          // ── Phase 3: Next cycle setup (ONLY place where timing is calculated) ──
          const nextLane = this.selectNextLane(updated);
          updated.activeLaneId = nextLane.id;
          updated.signalState = 'GREEN';

          // Refresh vehicle counts at cycle boundary
          const counts = this.counter.getCounts();
          counts.forEach(c => {
            const lane = updated.lanes.find(l => l.id === c.laneId);
            if (lane) {
              lane.vehicleCount = c.count;
              lane.queueLength = Math.max(0, Math.round(c.count * 0.4));
            }
          });

          // Calculate green time for the NEW lane using current data
          const nextCount = counts.find(c => c.laneId === nextLane.id)?.count ?? 10;
          const nextSpeed = nextLane.averageSpeed || 30;
          updated.remainingGreenTime = this.engine.calculateSpeedAwareDuration(nextCount, nextSpeed);
          updated.cycleCount += 1;
          this.cycleLocked = true; // Lock the new cycle
        }
      }
    }

    // ── Phase 4: Traffic simulation (independent of signal state machine) ──
    // Vehicles clear on green lanes
    const activeLane = updated.lanes.find(l => l.id === updated.activeLaneId);
    if (activeLane && updated.signalState === 'GREEN' && activeLane.vehicleCount > 0) {
      activeLane.vehicleCount = Math.max(0, activeLane.vehicleCount - 1);
      activeLane.queueLength = Math.max(0, activeLane.queueLength - 1);
      activeLane.averageSpeed = Math.min(55, activeLane.averageSpeed + 0.5);
    }

    // Vehicles arrive on red lanes, speed drops
    updated.lanes.forEach(lane => {
      if (lane.id !== updated.activeLaneId) {
        if (Math.random() > 0.6) {
          lane.vehicleCount += 1;
          lane.queueLength = Math.min(lane.queueLength + 1, 30);
        }
        lane.averageSpeed = Math.max(0, lane.averageSpeed - 0.3);
      }

      lane.speedCategory = this.classifySpeed(lane.averageSpeed);
      lane.isCongested = lane.vehicleCount > 20 && lane.averageSpeed < 15;
      lane.isBlocked = lane.averageSpeed < 5 && lane.vehicleCount > 5;
    });

    return updated;
  }

  private classifySpeed(speed: number): SpeedCategory {
    if (speed < 15) return 'slow';
    if (speed > 35) return 'fast';
    return 'normal';
  }

  /**
   * Select next lane using density + speed priority.
   * If an emergency override is queued, it takes priority at the cycle boundary.
   */
  private selectNextLane(intersection: Intersection): Lane {
    // Check for queued emergency override (applied ONLY at cycle boundary)
    if (this.pendingEmergencyLane) {
      const eLane = intersection.lanes.find(l => l.id === this.pendingEmergencyLane);
      if (eLane) {
        this.emergencyActive = true;
        // Don't clear pending yet — it stays active until explicitly cleared
        return eLane;
      }
    }

    const otherLanes = intersection.lanes.filter(l => l.id !== intersection.activeLaneId);

    // Priority score: higher count + lower speed = higher priority
    otherLanes.sort((a, b) => {
      const scoreA = a.vehicleCount * (1 + Math.max(0, 40 - a.averageSpeed) / 40);
      const scoreB = b.vehicleCount * (1 + Math.max(0, 40 - b.averageSpeed) / 40);
      return scoreB - scoreA;
    });

    const currentIdx = intersection.lanes.findIndex(l => l.id === intersection.activeLaneId);
    return otherLanes[0] || intersection.lanes[(currentIdx + 1) % intersection.lanes.length];
  }

  /**
   * Queue an emergency override. It will be applied at the NEXT cycle boundary,
   * NOT mid-cycle. This guarantees signal consistency.
   */
  setEmergencyOverride(laneId: string | null): void {
    this.pendingEmergencyLane = laneId;
    if (!laneId) {
      this.emergencyActive = false;
    }
  }

  isEmergencyActive(): boolean {
    return this.emergencyActive;
  }

  isCycleLocked(): boolean {
    return this.cycleLocked;
  }

  getCounter(): VehicleCounter {
    return this.counter;
  }

  getEngine(): TimingEngine {
    return this.engine;
  }
}
