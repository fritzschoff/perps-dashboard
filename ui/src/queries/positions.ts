import { useQuery } from 'react-query';
import { OPTIMISM_GRAPH_URL } from '../utils/constants';
import { utils } from 'ethers';
import { SortConfig } from '../components/PositionsTable';

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
  entryPrice: string;
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

export interface FilterOptions {
  asset: string;
  liquidated: boolean;
  open: boolean;
  openedAt: number;
  closedAt: number;
}

const body = (
  filterOptions: FilterOptions,
  sortConfig: SortConfig,
  address?: string,
  skip?: number
) => {
  if (address) {
    return `query futurePositions {
    futuresPositions(first: 1000, skip: ${skip}, where: {account: "${address}"}) {
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
      entryPrice
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
    futuresPositions(skip: ${skip}, first: 1000,
      orderBy: "${sortConfig[0]}", orderDirection: "${
    sortConfig[1] ? 'desc' : 'asc'
  }", where: {
    asset: "${utils.formatBytes32String(filterOptions.asset)}",
    isLiquidated: ${filterOptions.liquidated}
    isOpen: ${filterOptions.open}
    openTimestamp_lt: "${filterOptions.openedAt}"
    closeTimestamp_gt: "${filterOptions.closedAt}"
  }) {
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
      entryPrice
      exitPrice
    }
    futuresStats(first: 1) {
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

const refetchMore = async ({
  address,
  skip,
  filterOptions,
  sortConfig,
}: {
  address?: string;
  skip: number;
  filterOptions: FilterOptions;
  sortConfig: SortConfig;
}) => {
  const response = await fetch(OPTIMISM_GRAPH_URL, {
    method: 'POST',
    body: JSON.stringify({
      query: body(filterOptions, sortConfig, address?.toLowerCase(), skip),
    }),
  });

  const { data }: GraphResponse = await response.json();
  if (!!data?.futuresPositions.length) {
    const moreRes = await refetchMore({
      filterOptions,
      sortConfig,
      address,
      skip: skip + 1000,
    });
    if (moreRes?.futuresPositions.length)
      data.futuresPositions = data.futuresPositions.concat(
        moreRes?.futuresPositions
      );
  }
  return data;
};

function useGetPositions({
  address,
  filterOptions,
  sortConfig,
}: {
  address?: string;
  filterOptions: FilterOptions;
  sortConfig: SortConfig;
}) {
  return useQuery(['positions', address?.toString()], async () => {
    try {
      const data = await refetchMore({
        address,
        skip: 0,
        filterOptions,
        sortConfig,
      });
      return {
        futuresStats: data?.futuresStats,
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
    } catch (error) {
      console.error(error);
      return { futuresPositions: [], futuresStats: [] };
    }
  });
}

export default useGetPositions;

function toDateTime(secs: number) {
  const t = new Date(1970, 0, 1);
  t.setSeconds(secs);
  return t;
}
