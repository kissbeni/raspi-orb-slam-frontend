import React from 'react';
import { NumericStat } from '../../../common/common-types';
import { StatWidget } from '../stat-widget/stat-widget';

export type NumericStatWidgetParams = {
  title: string;
  stat: NumericStat;
  units?: string;
  shownOnGraph?: boolean;
  onShowOnGraph?: () => void;
};

export const NumericStatWidget = (params: NumericStatWidgetParams) => {
  return (
    <StatWidget
      {...params}
      value={params.stat.val}
      avg={params.stat.avg}
      min={params.stat.min}
      max={params.stat.max}
      onSave={() => {
        const myWindow = window.open('', 'MsgWindow', 'width=200,height=100');
        myWindow?.document.write(JSON.stringify(params.stat));
      }}
    />
  );
};

export default NumericStatWidget;
