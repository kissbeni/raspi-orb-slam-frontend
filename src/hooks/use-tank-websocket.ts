/* eslint-disable indent */
import { useEffect, useMemo, useState } from 'react';
import { createNumericStat, NumericStat, updateNumericStatState } from '../common/common-types';
import { DeserializerStream } from '../protocol/deserializer-stream';
import { deserializeMetricsPacket, PacketType } from '../protocol/tank-packets';

export interface TankWebSocket {
  fps: NumericStat;
  cpuUsage: NumericStat;
  memUsage: NumericStat;
  featureCount: NumericStat;
  systemStatus: string;
}

const TrackingStateToStringMap: Record<number, string> = {
  [-1]: 'System not ready',
  [0]: 'No images',
  [1]: 'Initializing',
  [2]: 'Running',
  [3]: 'Running, Lost',
};

export const useTankWebsocket = (url: string): TankWebSocket => {
  const [fps, setFps] = useState(createNumericStat());
  const [cpuUsage, setCpuUsage] = useState(createNumericStat());
  const [memUsage, setMemUsage] = useState(createNumericStat());
  const [featureCount, setFeatureCount] = useState(createNumericStat());
  const [systemStatus, setSystemStatus] = useState('Disconnected');
  const [wsReconnect, setWsReconnect] = useState(0);

  useEffect(() => {
    console.log('Websocket start', url, wsReconnect);
    const ws = new WebSocket(url);
    ws.onopen = () => {
      setSystemStatus('Connected');
    };
    ws.onclose = () => {
      setTimeout(() => setWsReconnect((x) => x + 1), 10000);
      setSystemStatus('Disconnected');
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
  };
};
