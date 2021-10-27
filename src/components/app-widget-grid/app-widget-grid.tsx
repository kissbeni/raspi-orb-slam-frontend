import { Grid, CircularProgress } from '@mui/material';
import AppWidget from '../app-widget/app-widget';
import NumberWidget from '../widgets/stat-widget/stat-widget';
import CenteringBox from '../centering-box/centering-box';
import classes from './app-widget-grid.module.css';
import { Box } from '@mui/system';
import { HistoryChartWidget } from '../widgets/history-chart-widget/history-chart-widget';

export const AppWidgetGrid = () => {
  return (
    <>
      <Grid container spacing={2} direction="row" padding={2}>
        <Grid item>
          <NumberWidget
            title="Processing speed"
            value={15.2}
            max={20}
            min={2.1}
            avg={14.6}
            showChartIcon={true}
            units="FPS"
          />
        </Grid>
        <Grid item>
          <NumberWidget
            title="CPU usage"
            value={48}
            min={15}
            max={87}
            avg={54}
            units="%"
            showChartIcon={true}
          />
        </Grid>
        <Grid item>
          <NumberWidget
            title="Current features"
            value={75}
            min={0}
            max={107}
            avg={46}
            showChartIcon={true}
          />
        </Grid>
        <Grid item>
          <NumberWidget
            title="Mission time"
            value="T+00:08:15.117"
            extraInfo={`Started at ${new Date().toISOString()}`}
          />
        </Grid>
        <Grid item>
          <NumberWidget title="Status" value="Running" extraInfo="For 69 seconds" />
        </Grid>
      </Grid>
      <Grid container spacing={2} direction="row" padding={2}>
        <Grid item>
          <AppWidget title="Live camera feed">
            <CenteringBox width={640} height={480}>
              <CircularProgress />
              <span>Connecting to video stream</span>
            </CenteringBox>
            {/*<img src="https://www.androidguys.com/wp-content/uploads/2016/01/black-white-background-2.jpg" width="640" />*/}
          </AppWidget>
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
