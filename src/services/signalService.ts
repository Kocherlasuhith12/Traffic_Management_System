// ─── signalService.ts ───
// Service for managing signal controller lifecycle.

import { SignalController } from '@/features/signal-control/SignalController';
import { VehicleCounter } from '@/features/signal-control/VehicleCounter';
import { TimingEngine } from '@/features/signal-control/TimingEngine';
import { initialVehicleCounts, initialVehicleCounts2 } from '@/data/vehicleCounts';

/**
 * Create a signal controller for intersection 1.
 */
export const createSignalController1 = (): SignalController => {
  const counter = new VehicleCounter(initialVehicleCounts);
  const engine = new TimingEngine();
  return new SignalController(counter, engine);
};

/**
 * Create a signal controller for intersection 2.
 */
export const createSignalController2 = (): SignalController => {
  const counter = new VehicleCounter(initialVehicleCounts2);
  const engine = new TimingEngine();
  return new SignalController(counter, engine);
};
