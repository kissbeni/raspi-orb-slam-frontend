import classes from './camera-widget.module.css';
import { CircularProgress } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import AppWidget from '../../app-widget/app-widget';
import CenteringBox from '../../centering-box/centering-box';
import { TrackedPoint } from '../../../common/common-types';

export type CameraWidgetParams = {
  streamUrl: string;
  trackedPoints: TrackedPoint[];
};

type ExtendedWindowType = Window & {
  lastFrameUpdate: Date;
};

export const CameraWidget = (params: CameraWidgetParams) => {
  const [loading, setLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState(params.streamUrl);

  const _window = window as unknown as ExtendedWindowType;
  _window.lastFrameUpdate = new Date();

  useEffect(() => {
    const iv = setInterval(() => {
      const currentDate = new Date();
      if (currentDate.getTime() - _window.lastFrameUpdate.getTime() > 10000) {
        setLoading(true);
        setStreamUrl(`${params.streamUrl}?t=${currentDate.getTime()}`);
      }
    }, 2500);

    return () => clearInterval(iv);
  }, [setLoading, setStreamUrl]);

  const handleImageUpdate = useCallback(() => {
    setLoading(false);
    _window.lastFrameUpdate = new Date();
  }, []);

  return (
    <AppWidget title="Live camera feed">
      {loading && (
        <CenteringBox width={640} height={480}>
          <CircularProgress />
          <br />
          <span>Connecting to video stream</span>
        </CenteringBox>
      )}
      <img
        className={loading ? classes.hideStream : ''}
        src={streamUrl}
        onLoad={handleImageUpdate}
        width="640"
      />
      <svg
        className={`${loading ? classes.hideStream : ''} ${classes.pointOverlayCanvas}`}
        width="640"
        height="480"
      >
        {params.trackedPoints.map((x, i) => (
          <rect key={i} width="4" height="4" fill="#00ffff" x={x.x} y={x.y}></rect>
        ))}
      </svg>
    </AppWidget>
  );
};

export default CameraWidget;
