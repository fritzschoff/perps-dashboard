import { Flex, Heading, Spinner, Text } from '@chakra-ui/react';
import { FC } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PositionsTable } from './components/PositionsTable';
import useGetPositions from './queries/positions';

export const Wallet: FC = () => {
  const params = useParams();
  const { data, isLoading } = useGetPositions(params.walletAddress);
  return (
    <Flex flexDir="column">
      <Link to="/" style={{ marginBottom: '20px' }}>
        Back
      </Link>
      <Heading size="sm">{params?.walletAddress}</Heading>
      {isLoading ? (
        <Spinner colorScheme="cyan" />
      ) : (
        <>
          {data?.futuresStats.map((stats) => (
            <Flex flexDir="column" key="only-one">
              <Text>Fees Paid: ${Number(stats.feesPaid) / 1e18}</Text>
              <Text>Liquidations: {stats.liquidations}</Text>
              <Text>PNL: ${Number(stats.pnl) / 1e18}</Text>
              <Text>
                PNL Minus Fees: ${Number(stats.pnlWithFeesPaid) / 1e18}
              </Text>
              <Text>Total trades: {stats.totalTrades}</Text>
              <Text>Total volume: {stats.totalVolume}</Text>
              <Text>Cross Margin Volume: {stats.crossMarginVolume}</Text>
            </Flex>
          ))}
          <PositionsTable
            positions={data?.futuresPositions || []}
            stats={data?.futuresStats || []}
          />
        </>
      )}
    </Flex>
  );
};
