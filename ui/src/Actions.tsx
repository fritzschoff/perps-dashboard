import { ArrowBackIcon } from '@chakra-ui/icons';
import { Flex, Heading } from '@chakra-ui/react';
import { FC } from 'react';
import { Link } from 'react-router-dom';

export const Actions: FC = () => {
  return (
    <Flex flexDir="column" p="2" justifyContent="center" alignItems="center">
      <Link to="/" style={{ marginBottom: '20px' }}>
        <Flex gap="2" alignItems="center">
          <ArrowBackIcon />
          <Heading size="md">Back</Heading>
        </Flex>
      </Link>
    </Flex>
  );
};
