import { FC, useState } from 'react';
import {
  Flex,
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
import { MARKETS } from '../utils/constants';

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

export const PositionsTable: FC<{
  address?: string;
}> = ({ address }) => {
  const toast = useToast();
  const [sortConfig, setSortConfig] = useState<SortConfig>(['account', true]);
  const { register, getValues, setValue } = useForm({
    defaultValues: {
      asset: 'sETH',
      liquidated: true,
      open: false,
      openedAt: new Date(),
      closedAt: monthAgo(),
    },
  });
  const { data: positions, isLoading } = useGetPositions({
    address,
    filterOptions: {
      ...getValues(),
      openedAt: Math.round(getValues('openedAt').getTime() / 1000),
      closedAt: Math.round(getValues('closedAt').getTime() / 1000),
    },
    sortConfig,
  });

  return (
    <>
      <Flex py="2" gap="2" justifyContent="space-around" w="100%">
        <RadioGroup
          onChange={(e) => {
            setValue('asset', e);
          }}
          value={getValues('asset')}
        >
          <Flex
            flexWrap="wrap"
            w="150px"
            gap="2"
            justifyContent="space-between"
          >
            {MARKETS.map((market, index) => (
              <Radio value={market} key={market.concat(index.toString())}>
                {market}
              </Radio>
            ))}
          </Flex>
        </RadioGroup>
        <Stack gap="2" ml="2">
          <Switch
            onChange={() => {
              setValue('liquidated', !getValues('liquidated'));
            }}
            isChecked={getValues('liquidated')}
          >
            Liquidated
          </Switch>
          <Switch
            onChange={() => {
              setValue('open', !getValues('open'));
            }}
            isChecked={getValues('open')}
          >
            Open
          </Switch>
          <Text>Opened At (default: now)</Text>
          <Input type="date" {...register('openedAt', { valueAsDate: true })} />
          <Text>Closed At (default: one month ago)</Text>
          <Input type="date" {...register('closedAt', { valueAsDate: true })} />
        </Stack>
      </Flex>
      {isLoading ? (
        <Spinner color="cyan.500" />
      ) : (
        <TableContainer w="100%">
          <Table>
            <Thead>
              <Tr>
                <Th
                  cursor="pointer"
                  onClick={() =>
                    setSortConfig((state) => ['account', !state[1]])
                  }
                >
                  Address
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() => setSortConfig((state) => ['asset', !state[1]])}
                >
                  Asset
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() =>
                    setSortConfig((state) => ['market', !state[1]])
                  }
                >
                  Market
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() =>
                    setSortConfig((state) => ['entryPrice', !state[1]])
                  }
                >
                  Entry Price
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() =>
                    setSortConfig((state) => ['exitPrice', !state[1]])
                  }
                >
                  Exit Price
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() =>
                    setSortConfig((state) => ['isLiquidated', !state[1]])
                  }
                >
                  Liquidated
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() =>
                    setSortConfig((state) => ['isOpen', !state[1]])
                  }
                >
                  Open
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() =>
                    setSortConfig((state) => ['openTimestamp', !state[1]])
                  }
                >
                  Opened at
                </Th>
                <Th
                  cursor="pointer"
                  onClick={() =>
                    setSortConfig((state) => ['closeTimestamp', !state[1]])
                  }
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
                    <Td>${(Number(position.entryPrice) / 1e18).toFixed(2)}</Td>
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
      )}
    </>
  );
};

function monthAgo() {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date;
}
