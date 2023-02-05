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
import { FuturePosition } from '../queries/positions';

export const PositionsTable: FC<{
  positions: FuturePosition[];
}> = ({ positions }) => {
  const toast = useToast();
  console.log(positions);
  return (
    <TableContainer w="100%">
      <Table>
        <Thead>
          <Tr>
            <Th>Address</Th>
            <Th>Asset</Th>
            <Th>Market</Th>
            <Th>Exit Price</Th>
            <Th>Liquidated</Th>
            <Th>Open</Th>
            <Th>Opened at</Th>
            <Th>Closed at</Th>
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
              <Td>${Number(position.exitPrice) / 1e18}</Td>
              <Td>{position.isLiquidated ? `💀` : `NO`}</Td>
              <Td>{position.isOpen ? `✅` : `❌`}</Td>
              <Td>{position?.openTimestamp}</Td>
              <Td>{position?.closeTimestamp}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
