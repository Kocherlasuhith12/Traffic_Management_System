// ─── useTrafficSimulation.ts ───
// Main simulation hook that drives the entire traffic system.

import { useState, useEffect, useCallback, useRef } from 'react';
import { Intersection, TrafficMetrics, MLPrediction, HistoricalDataPoint } from '@/types/traffic';
import { SignalController } from '@/features/signal-control/SignalController';
import { createDefaultIntersections, generateHistoricalData } from '@/data/mockTrafficData';
import { createSignalController1, createSignalController2 } from '@/services/signalService';
import { getTrafficMetrics } from '@/services/trafficService';
import { generatePredictions, getMLInsightSummary } from '@/services/mlService';
import { trafficScenarios } from '@/data/scenarios';

export interface SimulationState {
  intersections: Intersection[];
  metrics: TrafficMetrics[];
  predictions: MLPrediction[];
  mlInsight: string;
  isRunning: boolean;
  activeScenario: string;
  historicalData: HistoricalDataPoint[];
  elapsedSeconds: number;
}

export const useTrafficSimulation = () => {
  const controllerRef = useRef<SignalController[]>([]);
  const [state, setState] = useState<SimulationState>(() => {
    const intersections = createDefaultIntersections();
    const historical = generateHistoricalData();
    return {
      intersections,
      metrics: intersections.map(i => getTrafficMetrics(i)),
      predictions: [],
      mlInsight: 'Initializing ML analysis...',
      isRunning: true,
      activeScenario: 'normal',
      historicalData: historical,
      elapsedSeconds: 0,
    };
  });

  // Initialize controllers
  useEffect(() => {
    controllerRef.current = [createSignalController1(), createSignalController2()];
  }, []);

  // Main simulation loop - 1 tick per second
  useEffect(() => {
    if (!state.isRunning) return;

    const interval = setInterval(() => {
      setState(prev => {
        const controllers = controllerRef.current;
        if (controllers.length === 0) return prev;

        const updatedIntersections = prev.intersections.map((intersection, idx) => {
          const controller = controllers[idx];
          if (!controller) return intersection;
          return controller.tick(intersection);
        });

        const metrics = updatedIntersections.map(i => getTrafficMetrics(i));

        // Run ML predictions every 5 seconds
        let predictions = prev.predictions;
        let mlInsight = prev.mlInsight;
        if (prev.elapsedSeconds % 5 === 0) {
          const counts = updatedIntersections[0].lanes.map(l => ({
            laneId: l.id,
            laneName: l.name,
            count: l.vehicleCount,
            timestamp: Date.now(),
          }));
          predictions = generatePredictions(counts, prev.historicalData);
          mlInsight = getMLInsightSummary(predictions);
        }

        return {
          ...prev,
          intersections: updatedIntersections,
          metrics,
          predictions,
          mlInsight,
          elapsedSeconds: prev.elapsedSeconds + 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isRunning]);

  const toggleSimulation = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  }, []);

  const setScenario = useCallback((scenarioId: string) => {
    const scenario = trafficScenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    setState(prev => {
      const updated = { ...prev, activeScenario: scenarioId };
      // Update base counts in controllers
      const controller = controllerRef.current[0];
      if (controller) {
        scenario.laneConfigs.forEach(config => {
          controller.getCounter().updateBaseCount(config.laneId, config.baseCount);
        });
      }
      return updated;
    });
  }, []);

  return {
    ...state,
    toggleSimulation,
    setScenario,
  };
};
