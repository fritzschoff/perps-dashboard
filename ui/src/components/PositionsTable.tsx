import { FC } from 'react';
import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import { FuturePosition, FuturesStats } from '../queries/positions';

export const PositionsTable: FC<{
  positions: FuturePosition[];
  stats: FuturesStats[];
}> = ({ positions, stats }) => {
  const toast = useToast();
  return (
    <TableContainer w="100%">
      <Table>
        <Thead>
          <Tr>
            <Th>Address</Th>
            <Th>Asset</Th>
            <Th>Market</Th>
            <Th>Liquidated</Th>
          </Tr>
        </Thead>
        <Tbody>
          {positions.map((position, index) => (
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
                    position.account.substring(position.account.length - 5)
                  )}
              </Td>
              <Td>{position.asset}</Td>
              <Td>{position.marketKey}</Td>
              <Td>{position.isLiquidated ? `💀` : `NO`}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
