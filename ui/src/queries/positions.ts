import { useQuery } from 'react-query';
import { PERPS_V2_DASHBOARD_GRAPH_URL } from '../utils/constants';
import { utils } from 'ethers';
import { SortConfig } from '../components/PositionsTable';
import { useGetMarkets } from './markets';

interface GraphResponse {
  data: {
    futuresPositions: FuturePosition[];
    traders: Trader[];
  };
}

export interface FuturePosition {
  account: string;
  id: string;
  isLiquidated: boolean;
  asset: string;
  market: string;
  isOpen: boolean;
  openTimestamp: string;
  closeTimestamp: string;
  margin: string;
  initialMargin: string;
  entryPrice: string;
  long: boolean;
  lastPrice: string;
  totalVolume: string;
  exitPrice: string;
  size: string;
  maxLeverage: string;
}

export interface Trader {
  id: string;
  totalLiquidations: string;
  totalMarginLiquidated: string;
  feesPaidToSynthetix: string;
  pnl: string;
  trades: FuturesTrade[];
}

export interface FuturesTrade {
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
  deactivateLiquidated: boolean;
  deactivateOpen: boolean;
  deactivateOpenedAt: boolean;
  deactivateClosedAt: boolean;
}

const body = (
  filterOptions: FilterOptions,
  sortConfig: SortConfig,
  address?: string,
  skip?: number
) => {
  return `query info {
    futuresPositions(skip: ${skip}, first: 1000,
      orderBy: "${sortConfig[0]}", orderDirection: "${
    !sortConfig[1] ? 'desc' : 'asc'
  }", where: {
    ${address ? `account: "${address.toLowerCase()}",` : ''}
    ${
      filterOptions.asset === 'all'
        ? ''
        : `asset: "${utils.formatBytes32String(filterOptions.asset)}"`
    },
    ${
      filterOptions.deactivateLiquidated
        ? ''
        : `isLiquidated: ${filterOptions.liquidated},`
    }
    ${filterOptions.deactivateOpen ? '' : `isOpen: ${filterOptions.open},`}
    ${
      filterOptions.deactivateOpenedAt
        ? ''
        : `openTimestamp_gt: "${filterOptions.openedAt}",`
    }
    ${
      filterOptions.deactivateClosedAt
        ? ''
        : !filterOptions.deactivateOpen && !filterOptions.open
        ? `closeTimestamp_lt: "${filterOptions.closedAt}"`
        : ''
    }
  }) {
      id
      account
      isLiquidated
      market
      isOpen
      openTimestamp
      closeTimestamp
      margin
      initialMargin
      entryPrice
      lastPrice
      exitPrice
      size
      long
      trades
      totalVolume
    }
    traders(first: 1, where: {${
      address ? `id: "${address.toLowerCase()}",` : ''
    }}) {
      id
      totalLiquidations
      totalMarginLiquidated
      feesPaidToSynthetix
      trades {
        id
      }
      pnl
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
  const response = await fetch(PERPS_V2_DASHBOARD_GRAPH_URL, {
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
  const markets = useGetMarkets();
  return useQuery(
    ['positions', address?.toString(), filterOptions, sortConfig.toString()],
    async () => {
      try {
        const data = await refetchMore({
          address,
          skip: 0,
          filterOptions,
          sortConfig,
        });

        return {
          futuresStats: data?.traders,
          futuresPositions: data?.futuresPositions
            .map((position) => ({
              ...position,
              maxLeverage:
                markets.data?.find(
                  (d) => d.id.toLowerCase() === position.market.toLowerCase()
                )?.maxLeverage || '0',
              asset:
                markets.data?.find(
                  (d) => d.id.toLowerCase() === position.market.toLowerCase()
                )?.asset || 'not found',
              market: markets.data?.find(
                (d) => d.id.toLowerCase() === position.market.toLowerCase()
              )?.marketKey,
              openTimestamp: toDateTime(
                Number(position.openTimestamp)
              ).toLocaleDateString(),
              closeTimestamp:
                position.closeTimestamp === null
                  ? '-'
                  : toDateTime(
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
    },
    {
      enabled: false,
    }
  );
}

export default useGetPositions;

function toDateTime(secs: number) {
  const t = new Date(1970, 0, 1);
  t.setSeconds(secs);
  return t;
}
