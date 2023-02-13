import { useQuery } from 'react-query';
import { PERPS_V2_DASHBOARD_GRAPH_URL } from '../utils/constants';

export function useGetSynthetix() {
  return useQuery(['synthetix'], async () => {
    const response = await fetch(PERPS_V2_DASHBOARD_GRAPH_URL, {
      method: 'POST',
      body: JSON.stringify({
        query: `query snx {
                    synthetix(id: "synthetix") {
                        feesByLiquidations
                        feesByPositionModifications
                    }
                }`,
      }),
    });
    const {
      data,
    }: {
      data: {
        synthetix: {
          feesByLiquidations: string;
          feesByPositionModifications: string;
        };
      };
    } = await response.json();
    return data;
  });
}
