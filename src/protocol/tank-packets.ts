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
