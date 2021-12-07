import { roundToPrecision } from './utils';

export type LedColor = {
  r: number;
  g: number;
  b: number;
};

export type NumericStat = {
  val: number;
  min: number;
  max: number;
  avg: number;
  sampleCount: number;
};

export const createNumericStat = (min = 0): NumericStat => ({
  val: 0,
  min,
  max: 0,
  avg: 0,
  sampleCount: 0,
});

export const updateNumericStatState = (
  newVal: number,
  setter: (f: (p: NumericStat) => NumericStat) => void
) => {
  setter((prev) => ({
    val: roundToPrecision(newVal),
    sampleCount: prev.sampleCount + 1,
    min: Math.min(prev.min, newVal),
    max: Math.max(prev.max, newVal),
    avg: roundToPrecision((newVal + prev.avg) / 2),
  }));
};

export type Point2D = {
  x: number;
  y: number;
};

export type Point3D = {
  x: number;
  y: number;
  z: number;
};
