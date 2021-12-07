import { Grid, CircularProgress } from '@mui/material';
import AppWidget from '../app-widget/app-widget';
import NumberWidget from '../widgets/stat-widget/stat-widget';
import CenteringBox from '../centering-box/centering-box';
import classes from './app-widget-grid.module.css';
import { Box } from '@mui/system';
import { HistoryChartWidget } from '../widgets/history-chart-widget/history-chart-widget';
import { useTankWebsocket } from '../../hooks/use-tank-websocket';
import NumericStatWidget from '../widgets/numeric-stat-widget/numeric-stat-widget';
import CameraWidget from '../widgets/camera-widget/camera-widget';

export const AppWidgetGrid = () => {
  const remote = useTankWebsocket('ws://192.168.88.41:4000/ws');

  return (
    <>
      <Grid container spacing={2} direction="row" padding={2}>
        <Grid item>
          <NumericStatWidget
            title="Processing speed"
            stat={remote.fps}
            showChartIcon={true}
            units="FPS"
          />
        </Grid>
        <Grid item>
          <NumericStatWidget
            title="CPU usage"
            stat={remote.cpuUsage}
            units="%"
            showChartIcon={true}
          />
        </Grid>
        <Grid item>
          <NumericStatWidget
            title="Memory usage"
            stat={remote.memUsage}
            units="%"
            showChartIcon={true}
          />
        </Grid>
        <Grid item>
          <NumericStatWidget
            title="Current features"
            stat={remote.featureCount}
            showChartIcon={true}
          />
        </Grid>
        <Grid item flex={1}>
          <NumberWidget title="Status" value={remote.systemStatus} />
        </Grid>
      </Grid>
      <Grid container spacing={2} direction="row" padding={2}>
        <Grid item>
          <CameraWidget streamUrl="http://192.168.88.41:4000/video.mjpeg" />
        </Grid>
        <Grid item>
          <AppWidget title="Point cloud">
            <img
              src="https://www.androidguys.com/wp-content/uploads/2016/01/black-white-background-2.jpg"
              width="640"
            />
          </AppWidget>
        </Grid>
      </Grid>
      <Box className={classes.graphBox}>
        <HistoryChartWidget />
      </Box>
    </>
  );
};

export default AppWidgetGrid;
