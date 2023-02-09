import { FC, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Spinner,
  Stack,
  Switch,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import useGetPositions from '../queries/positions';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetMarkets } from '../queries/markets';

export type SortConfig = [
  (
    | 'account'
    | 'asset'
    | 'market'
    | 'entryPrice'
    | 'exitPrice'
    | 'isLiquidated'
    | 'isOpen'
    | 'openTimestamp'
    | 'closeTimestamp'
  ),
  boolean
];

export const PositionsTable: FC = () => {
  const params = useParams();
  const toast = useToast();
  const { data } = useGetMarkets();
  const [isRefetchLoading, setRefetchLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>(['account', true]);
  const { register, getValues, setValue, watch } = useForm({
    defaultValues: {
      asset: 'all',
      liquidated: false,
      deactivateLiquidated: true,
      open: false,
      deactivateOpen: true,
      openedAt: monthAgo(),
      closedAt: new Date(),
    },
  });
  const {
    data: positions,
    isLoading,
    refetch,
  } = useGetPositions({
    address: params.walletAddress,
    filterOptions: {
      ...watch(),
      openedAt: Math.round(watch('openedAt').getTime() / 1000),
      closedAt: Math.round(watch('closedAt').getTime() / 1000),
    },
    sortConfig,
  });

  const triggerRefetch = () => {
    setRefetchLoading(true);
    refetch().then(() => setRefetchLoading(false));
  };

  return (
    <>
      <Flex py="2" gap="2" justifyContent="space-around" w="100%">
        <RadioGroup
          onChange={(e) => {
            setValue('asset', e);
          }}
          value={watch('asset')}
        >
          <Flex
            flexWrap="wrap"
            w="150px"
            gap="2"
            justifyContent="space-between"
          >
            {data &&
              data.map((market, index) => (
                <Radio
                  value={market.asset}
                  key={market.asset.concat(index.toString())}
                >
                  {market.asset}
                </Radio>
              ))}
            <Radio value="all">All</Radio>
          </Flex>
        </RadioGroup>
        <Stack gap="2">
          <Switch
            disabled={watch('deactivateLiquidated')}
            onChange={() => {
              setValue('liquidated', !getValues('liquidated'));
              if (getValues('liquidated')) {
                setValue('open', false);
              }
            }}
            isChecked={watch('liquidated')}
          >
            Liquidated
          </Switch>
          <Checkbox
            onChange={() => {
              setValue(
                'deactivateLiquidated',
                !getValues('deactivateLiquidated')
              );
            }}
            isChecked={watch('deactivateLiquidated')}
          >
            Deactivate liquidated option
          </Checkbox>
          <Switch
            disabled={watch('deactivateOpen')}
            onChange={() => {
              setValue('open', !getValues('open'));
              if (getValues('open')) {
                setValue('liquidated', false);
              }
            }}
            isChecked={watch('open')}
          >
            Open
          </Switch>
          <Checkbox
            onChange={() => {
              setValue('deactivateOpen', !getValues('deactivateOpen'));
            }}
            isChecked={watch('deactivateOpen')}
          >
            Deactivate open option
          </Checkbox>
        </Stack>
        <Stack gap="2">
          <Text>Opened At (default: one month ago)</Text>
          <Input type="date" {...register('openedAt', { valueAsDate: true })} />
          <Text>Closed At (default: now)</Text>
          <Input type="date" {...register('closedAt', { valueAsDate: true })} />
        </Stack>
      </Flex>
      <Button onClick={() => triggerRefetch()} disabled={isLoading}>
        Fetch
      </Button>
      {isLoading || isRefetchLoading ? (
        <Spinner color="cyan.500" />
      ) : (
        <>
          <Divider m="2" />
          <Heading>Stats from Trader</Heading>
          <Box
            borderWidth="1px"
            borderStyle="solid"
            borderColor="cyan.500"
            boxShadow="2xl"
            borderRadius="base"
            p="2"
            m="2"
          >
            {params?.walletAddress &&
              positions?.futuresStats.map((stats) => {
                return (
                  <Flex flexDir="column" key="only-one">
                    <Text>
                      Fees Paid: ${(Number(stats.feesPaid) / 1e18).toFixed(2)}
                    </Text>
                    <Text>Liquidations: {stats.liquidations}</Text>
                    <Text>PNL: ${(Number(stats.pnl) / 1e18).toFixed(2)}</Text>
                    <Text>
                      PNL Minus Fees: $
                      {(Number(stats.pnlWithFeesPaid) / 1e18).toFixed(2)}
                    </Text>
                    <Text>Total trades: {stats.totalTrades}</Text>
                    <Text>
                      Total volume: $
                      {(Number(stats.totalVolume) / 1e18).toFixed(2)}
                    </Text>
                    <Text>
                      Cross Margin Volume: $
                      {(Number(stats.crossMarginVolume) / 1e18).toFixed(2)}
                    </Text>
                  </Flex>
                );
              })}
          </Box>
          <TableContainer w="100%">
            <Table>
              <Thead>
                <Tr>
                  <Th
                    cursor="pointer"
                    onClick={() => {
                      setSortConfig((state) => ['account', !state[1]]);
                      triggerRefetch();
                    }}
                  >
                    Address
                  </Th>
                  <Th
                    cursor="pointer"
                    onClick={() => {
                      setSortConfig((state) => ['asset', !state[1]]);
                      triggerRefetch();
                    }}
                  >
                    Asset
                  </Th>
                  <Th
                    cursor="pointer"
                    onClick={() => {
                      setSortConfig((state) => ['market', !state[1]]);
                      triggerRefetch();
                    }}
                  >
                    Market
                  </Th>
                  <Th
                    cursor="pointer"
                    onClick={() => {
                      setSortConfig((state) => ['entryPrice', !state[1]]);
                      triggerRefetch();
                    }}
                  >
                    Entry Price
                  </Th>
                  <Th
                    cursor="pointer"
                    onClick={() => {
                      setSortConfig((state) => ['exitPrice', !state[1]]);
                      triggerRefetch();
                    }}
                  >
                    Exit Price
                  </Th>
                  <Th
                    cursor="pointer"
                    onClick={() => {
                      setSortConfig((state) => ['isLiquidated', !state[1]]);
                      triggerRefetch();
                    }}
                  >
                    Liquidated
                  </Th>
                  <Th
                    cursor="pointer"
                    onClick={() => {
                      setSortConfig((state) => ['isOpen', !state[1]]);
                      triggerRefetch();
                    }}
                  >
                    Open
                  </Th>
                  <Th
                    cursor="pointer"
                    onClick={() => {
                      setSortConfig((state) => ['openTimestamp', !state[1]]);
                      triggerRefetch();
                    }}
                  >
                    Opened at
                  </Th>
                  <Th
                    cursor="pointer"
                    onClick={() => {
                      setSortConfig((state) => ['closeTimestamp', !state[1]]);
                      triggerRefetch();
                    }}
                  >
                    Closed at
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {!!positions?.futuresPositions.length &&
                  positions.futuresPositions.map((position, index) => (
                    <Tr key={position.account.concat(index.toString())}>
                      <Td
                        cursor="pointer"
                        onClick={() => {
                          toast({
                            title: 'Copy to clipboard',
                            status: 'success',
                            isClosable: true,
                            duration: 5000,
                          });
                          navigator.clipboard.writeText(position.account);
                        }}
                      >
                        {position.account
                          .substring(0, 5)
                          .concat('...')
                          .concat(
                            position.account.substring(
                              position.account.length - 5
                            )
                          )}
                      </Td>
                      <Td>{position.asset}</Td>
                      <Td>{position.marketKey}</Td>
                      <Td>
                        ${(Number(position.entryPrice) / 1e18).toFixed(2)}
                      </Td>
                      <Td>${(Number(position.exitPrice) / 1e18).toFixed(2)}</Td>
                      <Td>{position.isLiquidated ? `💀` : `NO`}</Td>
                      <Td>{position.isOpen ? `✅` : `❌`}</Td>
                      <Td>{position?.openTimestamp}</Td>
                      <Td>{position?.closeTimestamp}</Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </TableContainer>
        </>
      )}
    </>
  );
};

function monthAgo() {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date;
}
