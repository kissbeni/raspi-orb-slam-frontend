/* eslint-disable indent */
import { Grid, CircularProgress } from '@mui/material';
import AppWidget from '../app-widget/app-widget';
import NumberWidget from '../widgets/stat-widget/stat-widget';
import CenteringBox from '../centering-box/centering-box';
import classes from './app-widget-grid.module.css';
import { Box } from '@mui/system';
import { HistoryChartWidget } from '../widgets/history-chart-widget/history-chart-widget';
import { TankWebSocket, useTankWebsocket } from '../../hooks/use-tank-websocket';
import NumericStatWidget from '../widgets/numeric-stat-widget/numeric-stat-widget';
import CameraWidget from '../widgets/camera-widget/camera-widget';
import { PointCloudWidget } from '../widgets/point-cloud-widget/point-cloud-widget';
import { useState } from 'react';

const pickStat = (remote: TankWebSocket, idx: number) => {
  switch (idx) {
    case 0:
      return remote.fps;
    case 1:
      return remote.cpuUsage;
    case 2:
      return remote.memUsage;
    case 3:
      return remote.featureCount;
    default:
      return remote.fps;
  }
};

export const AppWidgetGrid = () => {
  const remote = useTankWebsocket('ws://192.168.88.39:4000/ws');
  const [selectedStat, setSelectedStat] = useState(0);

  return (
    <>
      <Grid container spacing={2} direction="row" padding={2}>
        <Grid item>
          <NumericStatWidget
            title="Processing speed"
            stat={remote.fps}
            shownOnGraph={selectedStat === 0}
            onShowOnGraph={() => setSelectedStat(0)}
            units="FPS"
          />
        </Grid>
        <Grid item>
          <NumericStatWidget
            title="CPU usage"
            stat={remote.cpuUsage}
            units="%"
            shownOnGraph={selectedStat === 1}
            onShowOnGraph={() => setSelectedStat(1)}
          />
        </Grid>
        <Grid item>
          <NumericStatWidget
            title="Memory usage"
            stat={remote.memUsage}
            units="%"
            shownOnGraph={selectedStat === 2}
            onShowOnGraph={() => setSelectedStat(2)}
          />
        </Grid>
        <Grid item>
          <NumericStatWidget
            title="Current features"
            stat={remote.featureCount}
            shownOnGraph={selectedStat === 3}
            onShowOnGraph={() => setSelectedStat(3)}
          />
        </Grid>
        <Grid item flex={1}>
          <NumberWidget title="Status" value={remote.systemStatus} />
        </Grid>
      </Grid>
      <Grid container spacing={2} direction="row" padding={2}>
        <Grid item>
          <CameraWidget
            streamUrl="http://192.168.88.39:4000/video.mjpeg"
            trackedPoints={remote.overlayPoints}
          />
        </Grid>
        <Grid item>
          <PointCloudWidget path={remote.cameraTrajectory} worldPoints={remote.worldPoints} />
        </Grid>
      </Grid>
      <Box className={classes.graphBox}>
        <HistoryChartWidget stat={pickStat(remote, selectedStat)} />
      </Box>
    </>
  );
};

export default AppWidgetGrid;
