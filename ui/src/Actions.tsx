import { ArrowBackIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { Flex, Heading, IconButton, Text, useToast } from '@chakra-ui/react';
import { FC, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGetDelayedOrder } from './queries/delayedOrders';
import useGetPositions from './queries/positions';
import { numberWithCommas } from './utils/numbers';

export const Actions: FC = () => {
  const toast = useToast();
  const { data: orders } = useGetDelayedOrder();

  const allEvents = useMemo(() => {
    return orders;
  }, [orders?.toString()]);

  return (
    <Flex flexDir="column" p="2" justifyContent="center" alignItems="center">
      <Link to="/" style={{ marginBottom: '20px' }}>
        <Flex gap="2" alignItems="center">
          <ArrowBackIcon />
          <Heading size="md">Back</Heading>
        </Flex>
      </Link>
      <Flex flexDir="column" gap="2">
        {allEvents?.map((event, i) => {
          return (
            <Flex
              key={event.timestamp.concat(i.toString())}
              borderColor="cyan.500"
              borderWidth="1px"
              borderStyle="solid"
              borderRadius="base"
              p="4"
              flexDir="column"
              gap="2"
            >
              <Text>
                Time:&nbsp;
                {new Date(Number(event.timestamp) * 1000).toLocaleDateString(
                  'en-US',
                  {
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                )}
              </Text>
              {event.type === 'futuresOrders' && (
                <>
                  <Heading size="sm">Delayed Order</Heading>
                  <Text>Status:&nbsp;{event.status}</Text>
                  <Text>
                    Size:&nbsp; $
                    {numberWithCommas((Number(event.size) / 1e18).toFixed(2))}
                  </Text>
                  <Text>Market:&nbsp;{event.market}</Text>
                  <Text
                    cursor="pointer"
                    onClick={() => {
                      toast({
                        title: 'Copy to clipboard',
                        status: 'success',
                        isClosable: true,
                        duration: 5000,
                      });
                      navigator.clipboard.writeText(event.account);
                    }}
                  >
                    Account:&nbsp;
                    {event.account
                      .substring(0, 5)
                      .concat('...')
                      .concat(
                        event.account.substring(event.account.length - 5)
                      )}
                    <IconButton
                      marginLeft="2"
                      variant="ghost"
                      aria-label="link to optimisim etherscan"
                      icon={<ExternalLinkIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(
                          'https://optimistic.etherscan.io/address/' +
                            event.account
                        );
                      }}
                    />
                  </Text>
                  <Text
                    cursor="pointer"
                    onClick={() => {
                      toast({
                        title: 'Copy to clipboard',
                        status: 'success',
                        isClosable: true,
                        duration: 5000,
                      });
                      navigator.clipboard.writeText(event.account);
                    }}
                  >
                    Keeper:&nbsp;
                    {event.keeper
                      .substring(0, 5)
                      .concat('...')
                      .concat(event.keeper.substring(event.keeper.length - 5))}
                    <IconButton
                      marginLeft="2"
                      variant="ghost"
                      aria-label="link to optimisim etherscan"
                      icon={<ExternalLinkIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(
                          'https://optimistic.etherscan.io/address/' +
                            event.keeper
                        );
                      }}
                    />
                  </Text>
                  <Text>Order ID:&nbsp;{event.orderId}</Text>
                  <Text>Target Round ID:&nbsp;{event.targetRoundId}</Text>
                </>
              )}
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
};
