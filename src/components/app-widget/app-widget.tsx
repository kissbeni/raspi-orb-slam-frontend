import { Grid, Paper } from '@mui/material';
import classes from './app-widget.module.css';
import { ReactNode } from 'react';

export type AppWidgetParams = {
  title: string;
  children?: ReactNode;
};

export const AppWidget = (params: AppWidgetParams) => {
  return (
    <Paper className={classes.root}>
      <Grid container direction="column">
        <Grid item className={classes.widgetHeader}>
          <span className={classes.widgetTitle}>{params.title}</span>
        </Grid>
        <Grid item className={classes.widgetContent}>
          {params.children}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AppWidget;
