// ─── mlService.ts ───
// Lightweight ML layer for traffic prediction.
// Clearly separated from rule-based logic in TimingEngine.

import { MLPrediction, HistoricalDataPoint, VehicleCountEntry } from '@/types/traffic';

/**
 * TREND ANALYSIS: Simple linear regression on recent vehicle counts.
 * Determines if traffic is increasing, decreasing, or stable.
 */
const analyzeTrend = (history: number[]): { slope: number; trend: 'increasing' | 'decreasing' | 'stable' } => {
  if (history.length < 3) return { slope: 0, trend: 'stable' };

  const n = history.length;
  const xMean = (n - 1) / 2;
  const yMean = history.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (history[i] - yMean);
    denominator += (i - xMean) * (i - xMean);
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const trend = slope > 0.5 ? 'increasing' : slope < -0.5 ? 'decreasing' : 'stable';
  return { slope, trend };
};

/**
 * Generate ML predictions for each lane based on historical data.
 * Uses trend analysis to recommend signal timing adjustments.
 */
export const generatePredictions = (
  currentCounts: VehicleCountEntry[],
  historicalData: HistoricalDataPoint[]
): MLPrediction[] => {
  return currentCounts.map(entry => {
    // Get history for this lane
    const laneHistory = historicalData
      .filter(h => h.laneId === entry.laneId)
      .slice(-10)
      .map(h => h.vehicleCount);

    // Add current count
    laneHistory.push(entry.count);

    const { slope, trend } = analyzeTrend(laneHistory);

    // Predict next count
    const predictedCount = Math.max(0, Math.round(entry.count + slope * 2));

    // Confidence based on data availability
    const confidence = Math.min(0.95, 0.5 + laneHistory.length * 0.05);

    // Recommended adjustment: extend green if traffic increasing, shorten if decreasing
    let recommendedAdjustment = 0;
    if (trend === 'increasing') recommendedAdjustment = Math.min(10, Math.round(slope * 3));
    if (trend === 'decreasing') recommendedAdjustment = Math.max(-5, Math.round(slope * 2));

    return {
      laneId: entry.laneId,
      predictedCount,
      confidence,
      trend,
      recommendedAdjustment,
    };
  });
};

/**
 * Get ML insight summary for display.
 */
export const getMLInsightSummary = (predictions: MLPrediction[]): string => {
  const increasing = predictions.filter(p => p.trend === 'increasing');
  const decreasing = predictions.filter(p => p.trend === 'decreasing');

  if (increasing.length > decreasing.length) {
    return `Traffic building up on ${increasing.length} lane(s). Signal timing extended proactively.`;
  } else if (decreasing.length > increasing.length) {
    return `Traffic easing on ${decreasing.length} lane(s). Reducing green time to improve efficiency.`;
  }
  return 'Traffic patterns stable. Maintaining current adaptive timing.';
};
