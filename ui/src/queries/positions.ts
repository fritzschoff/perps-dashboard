import { useQuery } from 'react-query';
import { OPTIMISM_GRAPH_URL } from '../utils/constants';
import { utils } from 'ethers';

interface GraphResponse {
  data: {
    futuresPositions: FuturePosition[];
    futuresStats: FuturesStats[];
  };
}

export interface FuturePosition {
  account: string;
  asset: string;
  id: string;
  isLiquidated: boolean;
  marketKey: string;
  isOpen: boolean;
  openTimestamp: string;
  closeTimestamp: string;
  margin: string;
  initialMargin: string;
  exitPrice: string;
}

export interface FuturesStats {
  account: string;
  feesPaid: string;
  liquidations: string;
  totalTrades: string;
  pnl: string;
  pnlWithFeesPaid: string;
  crossMarginVolume: string;
  totalVolume: string;
}

const body = (address?: string) => {
  if (address) {
    return `query futurePositions {
    futuresPositions(first: 1000, where: {account: "${address}"}) {
      id
      account
      isLiquidated
      asset
      marketKey
      isOpen
      openTimestamp
      closeTimestamp
      margin
      initialMargin
      exitPrice
    }
    futuresStats(where: {account: "${address}"}) {
      account
      feesPaid
      liquidations
      totalTrades
      pnl
      pnlWithFeesPaid
      crossMarginVolume
      totalVolume
    }
  }
`;
  }
  return `query futurePositions {
    futuresPositions {
      id
      account
      isLiquidated
      asset
      marketKey
      isOpen
      openTimestamp
      closeTimestamp
      margin
      initialMargin
      exitPrice
    }
    futuresStats {
      account
      feesPaid
      liquidations
      totalTrades
      pnl
      pnlWithFeesPaid
      crossMarginVolume
      totalVolume
    }
  }
`;
};

function useGetPositions(address?: string) {
  return useQuery(['positions', address?.toString()], async () => {
    const response = await fetch(OPTIMISM_GRAPH_URL, {
      method: 'POST',
      body: JSON.stringify({ query: body(address?.toLowerCase()) }),
    });
    const { data }: GraphResponse = await response.json();

    return {
      futuresStats: data.futuresStats,
      futuresPositions: data.futuresPositions
        .map((position) => ({
          ...position,
          asset: utils.parseBytes32String(position.asset),
          marketKey: utils.parseBytes32String(position.marketKey),
          openTimestamp: toDateTime(
            Number(position.openTimestamp)
          ).toLocaleDateString(),
          closeTimestamp: toDateTime(
            Number(position.closeTimestamp)
          ).toLocaleDateString(),
        }))
        .filter((position) => {
          if (address) {
            if (address === position.account) return true;
            return false;
          }
          return true;
        }) as FuturePosition[],
    };
  });
}

export default useGetPositions;

function toDateTime(secs: number) {
  var t = new Date(1970, 0, 1);
  t.setSeconds(secs);
  console.log(t.toLocaleDateString());
  return t;
}
