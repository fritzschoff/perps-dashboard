import { utils } from 'ethers';
import { useQuery } from 'react-query';
import { OPTIMISM_GRAPH_URL } from '../utils/constants';

interface FutureMarketsGraphResponse {
  data: {
    futuresMarkets: { marketKey: string; asset: string }[];
  };
}

export const useGetMarkets = () =>
  useQuery(['markets'], async () => {
    const response = await fetch(OPTIMISM_GRAPH_URL, {
      method: 'POST',
      body: JSON.stringify({
        query: `query futuresMarkets {
                    futuresMarkets {
                        marketKey 
                        asset
                    }
                }`,
      }),
    });
    const { data }: FutureMarketsGraphResponse = await response.json();
    return data.futuresMarkets
      .map((market) => ({
        marketKey: utils.parseBytes32String(market.marketKey),
        asset: utils.parseBytes32String(market.asset),
      }))
      .filter((market) => market.marketKey.includes('PERP'));
  });
