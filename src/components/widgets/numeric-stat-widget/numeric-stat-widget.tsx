import React from 'react';
import { NumericStat } from '../../../common/common-types';
import { StatWidget } from '../stat-widget/stat-widget';

export type NumericStatWidgetParams = {
  title: string;
  stat: NumericStat;
  units?: string;
  showChartIcon?: boolean;
};

export const NumericStatWidget = (params: NumericStatWidgetParams) => {
  return (
    <StatWidget
      {...params}
      value={params.stat.val}
      avg={params.stat.avg}
      min={params.stat.min}
      max={params.stat.max}
    />
  );
};

export default NumericStatWidget;
