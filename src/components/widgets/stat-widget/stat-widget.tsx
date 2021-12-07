import { Grid, IconButton, Tooltip } from '@mui/material';
import AppWidget from '../../app-widget/app-widget';
import classes from './stat-widget.module.css';
import ShowChartIcon from '@mui/icons-material/ShowChart';

export type StatWidgetParams = {
  title: string;
  value: number | string;
  min?: number;
  max?: number;
  avg?: number;
  extraInfo?: string;
  units?: string;
  showChartIcon?: boolean;
};

export const StatWidget = (params: StatWidgetParams) => {
  return (
    <AppWidget title={params.title}>
      <Grid container direction="row" spacing={2}>
        <Grid item container direction="column" alignItems="start" width="auto">
          <Grid item className={classes.mainStatArea}>
            <span className={classes.value}>{params.value}</span>
            <span className={classes.units}>{params.units}</span>
          </Grid>
          <Grid item className={classes.extraStats}>
            {params.min !== undefined && (
              <Tooltip title="Minimum">
                <span>{params.min}</span>
              </Tooltip>
            )}
            {params.max !== undefined && (
              <Tooltip title="Maximum">
                <span>{params.max}</span>
              </Tooltip>
            )}
            {params.avg !== undefined && (
              <Tooltip title="Average">
                <span>{params.avg}</span>
              </Tooltip>
            )}
            {params.extraInfo && <span>{params.extraInfo}</span>}
          </Grid>
        </Grid>
        {params.showChartIcon && (
          <Grid item display="flex" alignItems="end">
            <Tooltip title="Show history">
              <IconButton>
                <ShowChartIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        )}
      </Grid>
    </AppWidget>
  );
};

export default StatWidget;
