import { Box } from '@mui/material';
import { VictoryChart, VictoryLine } from 'victory';
import { NumericStat } from '../../../common/common-types';
import AppWidget from '../../app-widget/app-widget';

export type HistoryChartWidgetParams = {
  stat: NumericStat;
};

export const HistoryChartWidget = ({ stat }: HistoryChartWidgetParams) => {
  return (
    <AppWidget title="Graph">
      <Box style={{ width: '80vw' }}>
        <VictoryChart width={1700} height={200}>
          <VictoryLine
            style={{
              data: { stroke: 'tomato' },
            }}
            data={stat.samples
              .slice(Math.max(0, stat.samples.length - 1000), stat.samples.length - 1)
              .map((s, i) => ({ x: i, y: s }))}
          />
        </VictoryChart>
      </Box>
    </AppWidget>
  );
};
