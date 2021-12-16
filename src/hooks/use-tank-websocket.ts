/* eslint-disable indent */
import { useEffect, useMemo, useState } from 'react';
import {
  createNumericStat,
  NumericStat,
  Point3D,
  TrackedPoint,
  updateNumericStatState,
} from '../common/common-types';
import { DeserializerStream } from '../protocol/deserializer-stream';
import {
  deserializeMetricsPacket,
  deserializePathPacket,
  deserializeReportPacket,
  PacketType,
} from '../protocol/tank-packets';

export interface TankWebSocket {
  fps: NumericStat;
  cpuUsage: NumericStat;
  memUsage: NumericStat;
  featureCount: NumericStat;
  systemStatus: string;
  overlayPoints: TrackedPoint[];
  cameraTrajectory: Point3D[];
  worldPoints: Point3D[];
}

const TrackingStateToStringMap: Record<number, string> = {
  [-1]: 'System not ready',
  [0]: 'No images',
  [1]: 'Initializing',
  [2]: 'Running',
  [3]: 'Running, Lost',
};

type ExtendedWindowType = Window & {
  reconnectTimer?: NodeJS.Timeout;
};

export const useTankWebsocket = (url: string): TankWebSocket => {
  const [fps, setFps] = useState(createNumericStat());
  const [cpuUsage, setCpuUsage] = useState(createNumericStat());
  const [memUsage, setMemUsage] = useState(createNumericStat());
  const [featureCount, setFeatureCount] = useState(createNumericStat());
  const [systemStatus, setSystemStatus] = useState('Disconnected');
  const [overlayPoints, setOverlayPoints] = useState<TrackedPoint[]>([]);
  const [cameraTrajectory, setCameraTrajectory] = useState<Point3D[]>([]);
  const [worldPoints, setWorldPoints] = useState<Point3D[]>([]);
  const [wsReconnect, setWsReconnect] = useState(0);

  useEffect(() => {
    console.log('Websocket start', url, wsReconnect);
    const ws = new WebSocket(url);
    ws.onopen = () => {
      setSystemStatus('Waiting for telemetry');
    };
    ws.onclose = () => {
      const _window = window as unknown as ExtendedWindowType;
      if (_window.reconnectTimer) {
        clearTimeout(_window.reconnectTimer);
      }
      _window.reconnectTimer = setTimeout(() => setWsReconnect((x) => x + 1), 10000);
      setSystemStatus('Disconnected');
      setFps(createNumericStat());
      setCpuUsage(createNumericStat());
      setMemUsage(createNumericStat());
      setFeatureCount(createNumericStat());
      setOverlayPoints([]);
      setCameraTrajectory([]);
      setWorldPoints([]);
    };
    ws.onerror = () => {
      setSystemStatus('Protocol error');
    };
    ws.onmessage = async ({ data: blob }: { data: Blob }) => {
      const data = Buffer.from(await blob.arrayBuffer());
      const ds = new DeserializerStream(data);
      switch (ds.getByte()) {
        case PacketType.STAT: {
          const pkt = deserializeMetricsPacket(ds);
          updateNumericStatState(pkt.fps, setFps);
          updateNumericStatState(pkt.cpuUsage, setCpuUsage);
          updateNumericStatState(pkt.memUsage, setMemUsage);
          setSystemStatus(
            TrackingStateToStringMap[pkt.trackingState] ?? `STATE_${pkt.trackingState}`
          );
          break;
        }
        case PacketType.OPUD: {
          const pkt = deserializeReportPacket(ds);
          setOverlayPoints(pkt.overlay);
          setWorldPoints(pkt.worldPoints);
          updateNumericStatState(pkt.overlay.length, setFeatureCount);
          break;
        }
        case PacketType.CPUD: {
          const pkt = deserializePathPacket(ds);
          console.log('trajectory packet', pkt.currentCameraPos, pkt.index);
          setCameraTrajectory((prev) => [...prev, pkt.currentCameraPos]);
          break;
        }
      }
    };

    return () => ws.close();
  }, [wsReconnect]);

  return {
    fps,
    cpuUsage,
    memUsage,
    featureCount,
    systemStatus,
    overlayPoints,
    cameraTrajectory,
    worldPoints,
  };
};
