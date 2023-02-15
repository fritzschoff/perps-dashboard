import { useQuery } from 'react-query';
import { PERPS_V2_DASHBOARD_GRAPH_URL } from '../utils/constants';
import { useGetMarkets } from './markets';

interface DelayedOrderResponse {
  data: {
    futuresOrders: {
      id: string;
      size: string;
      market: string;
      account: string;
      orderId: string;
      targetRoundId: string;
      targetPrice: string;
      marginDelta: string;
      timestamp: string;
      keeper: string;
      status: string;
      type: string;
    }[];
  };
}

const refetchMore = async ({ skip }: { skip: number }) => {
  const response = await fetch(PERPS_V2_DASHBOARD_GRAPH_URL, {
    method: 'POST',
    body: JSON.stringify({
      query: `query DelayedOrders {
                futuresOrders(first: 1000, skip: ${skip}, oderBy: "timestamp", orderDirection: "desc") {
                    id
                    size
                    market
                    account
                    orderId
                    targetRoundId
                    targetPrice
                    marginDelta
                    timestamp
                    keeper
                    status
                }
            }`,
    }),
  });

  const { data }: DelayedOrderResponse = await response.json();
  if (!!data?.futuresOrders.length) {
    const moreRes = await refetchMore({ skip: skip + 1000 });
    if (moreRes?.futuresOrders.length)
      data.futuresOrders = data.futuresOrders.concat(moreRes?.futuresOrders);
  }
  return data;
};

export const useGetDelayedOrder = () => {
  const { data: marketData } = useGetMarkets();
  return useQuery(['markets', marketData?.toString()], async () => {
    const data = await refetchMore({ skip: 0 });

    return data.futuresOrders.map((data) => ({
      ...data,
      market: marketData?.find(
        (d) => d.id.toLowerCase() === data.market.toLowerCase()
      )?.marketKey,
      type: 'futuresOrders',
    }));
  });
};
