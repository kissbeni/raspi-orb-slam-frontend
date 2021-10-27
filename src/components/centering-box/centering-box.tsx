import { Box, BoxProps } from '@mui/material';
import { ReactNode } from 'react';

export type CenteringBoxParams =
  | {
      children?: ReactNode;
    }
  | BoxProps;

export const CenteringBox = (params: CenteringBoxParams) => {
  return (
    <Box flex={1} {...params} display="flex" flexDirection="row" alignItems="center">
      <Box display="flex" flex={1} flexDirection="column" alignItems="center">
        {params.children}
      </Box>
    </Box>
  );
};

export default CenteringBox;
