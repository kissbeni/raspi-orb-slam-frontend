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
  samples: number[];
};

export const createNumericStat = (min = 0): NumericStat => ({
  val: 0,
  min,
  max: 0,
  avg: 0,
  sampleCount: 0,
  samples: [],
});

export const updateNumericStatState = (
  newVal: number,
  setter: (f: (p: NumericStat) => NumericStat) => void
) => {
  const nv = roundToPrecision(newVal);
  setter((prev) => ({
    val: nv,
    sampleCount: prev.sampleCount + 1,
    samples: [...prev.samples, nv],
    min: Math.min(prev.min, nv),
    max: Math.max(prev.max, nv),
    avg: roundToPrecision((nv + prev.avg * prev.sampleCount) / (prev.sampleCount + 1)),
  }));
};

export type TrackedPoint = {
  x: number;
  y: number;
  flags: number;
};

export type Point3D = {
  x: number;
  y: number;
  z: number;
};
