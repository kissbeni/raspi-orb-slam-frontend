import { Point3D, TrackedPoint } from '../common/common-types';
import { DeserializerStream } from './deserializer-stream';

export enum PacketType {
  MOVE = 1, // Movement with speed
  STOP = 2, // Immediate stop
  LEDS = 3, // Update LED colors
  STAT = 4, // System statistics
  OPUD = 5, // Overlay and point update
  CPUD = 6, // Camera path update
}

export type MetricsPacket = {
  fps: number;
  cpuUsage: number;
  memUsage: number;
  trackingState: number;
};

export const deserializeMetricsPacket = (ds: DeserializerStream): MetricsPacket => {
  const fps = ds.getFloat();
  const cpuUsage = ds.getByte();
  const memUsage = ds.getByte();
  const trackingState = ds.getByte();

  return {
    fps,
    cpuUsage,
    memUsage,
    trackingState,
  };
};

export type ReportPacket = {
  overlay: TrackedPoint[];
  worldPoints: Point3D[];
};

export const deserializeReportPacket = (ds: DeserializerStream): ReportPacket => {
  const res: ReportPacket = { overlay: [], worldPoints: [] };

  let numOverlay = ds.getUint();

  while (numOverlay--) {
    const x = ds.getUint();
    const y = ds.getUint();
    const flags = ds.getByte();
    if (flags & 4) {
      res.overlay.push({
        x,
        y,
        flags,
      });
    }
  }

  let numWorldPoints = ds.getUint();

  while (numWorldPoints--) res.worldPoints.push(ds.getVec3());

  return res;
};

export type PathPacket = {
  currentCameraPos: Point3D;
  index: number;
};

export const deserializePathPacket = (ds: DeserializerStream): PathPacket => {
  const currentCameraPos = ds.getVec3();
  const index = ds.getUint();

  return {
    currentCameraPos,
    index,
  };
};
