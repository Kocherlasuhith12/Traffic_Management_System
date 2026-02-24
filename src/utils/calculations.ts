// ─── Utility calculations for traffic system ───

/**
 * Calculate average waiting time based on vehicle count and green duration.
 * Uses Little's Law approximation.
 */
export const calculateWaitTime = (vehicleCount: number, greenDuration: number, cycleDuration: number): number => {
  if (greenDuration <= 0) return 0;
  const effectiveGreen = greenDuration / cycleDuration;
  const avgWait = (cycleDuration * Math.pow(1 - effectiveGreen, 2)) / (2 * (1 - effectiveGreen * Math.min(vehicleCount / 20, 1)));
  return Math.max(0, Math.round(avgWait));
};

/**
 * Calculate throughput (vehicles per minute) for a lane.
 */
export const calculateThroughput = (greenDuration: number, cycleDuration: number, saturationFlow: number = 0.5): number => {
  return Math.round((greenDuration / cycleDuration) * saturationFlow * 60);
};

/**
 * Calculate congestion level (0 to 1) based on queue length and capacity.
 */
export const calculateCongestionLevel = (queueLength: number, capacity: number = 30): number => {
  return Math.min(1, Math.max(0, queueLength / capacity));
};

/**
 * Format seconds into MM:SS display.
 */
export const formatCountdown = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

/**
 * Percentage improvement calculation.
 */
export const percentImprovement = (before: number, after: number): number => {
  if (before === 0) return 0;
  return Math.round(((before - after) / before) * 100);
};

/**
 * Fixed-time signal duration (used as baseline for comparison).
 */
export const FIXED_GREEN_DURATION = 30;
export const FIXED_CYCLE_DURATION = 120;
