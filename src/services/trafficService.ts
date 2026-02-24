// ─── trafficService.ts ───
// Service layer for traffic data management.

import { Intersection, TrafficMetrics } from '@/types/traffic';
import { calculateWaitTime, calculateThroughput, calculateCongestionLevel, FIXED_GREEN_DURATION, FIXED_CYCLE_DURATION } from '@/utils/calculations';

/**
 * Calculate real-time traffic metrics for an intersection.
 */
export const getTrafficMetrics = (intersection: Intersection): TrafficMetrics => {
  const totalVehicles = intersection.lanes.reduce((s, l) => s + l.vehicleCount, 0);
  const totalQueue = intersection.lanes.reduce((s, l) => s + l.queueLength, 0);
  const avgCount = totalVehicles / intersection.lanes.length;

  // Adaptive metrics
  const adaptiveCycle = intersection.lanes.length * (intersection.remainingGreenTime + 3);
  const avgWait = calculateWaitTime(avgCount, intersection.remainingGreenTime, Math.max(adaptiveCycle, 40));
  const throughput = calculateThroughput(intersection.remainingGreenTime, Math.max(adaptiveCycle, 40));

  // Fixed-time baseline
  const fixedCycle = FIXED_CYCLE_DURATION;
  const avgWaitFixed = calculateWaitTime(avgCount, FIXED_GREEN_DURATION, fixedCycle);
  const throughputFixed = calculateThroughput(FIXED_GREEN_DURATION, fixedCycle);
  const queueFixed = Math.round(totalQueue * 1.4); // Fixed signals tend to have ~40% longer queues

  return {
    averageWaitTime: avgWait,
    averageWaitTimeFixed: avgWaitFixed,
    throughput,
    throughputFixed,
    queueLength: totalQueue,
    queueLengthFixed: queueFixed,
    congestionLevel: calculateCongestionLevel(totalQueue, intersection.lanes.length * 30),
  };
};
