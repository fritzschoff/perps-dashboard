import React, { useEffect } from 'react';
import {
  Button,
  Divider,
  Flex,
  Heading,
  Input,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { PositionsTable } from './components/PositionsTable';

function App() {
  const navigate = useNavigate();
  const { register, getValues } = useForm({
    defaultValues: { address: '' },
  });
  const { colorMode, toggleColorMode } = useColorMode();
  useEffect(() => {
    if (colorMode === 'light') {
      toggleColorMode();
    }
  }, [colorMode, toggleColorMode]);
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      gap="2"
    >
      <Heading size="sm">Add a wallet address:</Heading>
      <Input placeholder="Address" w="50%" {...register('address')} />
      <Button onClick={() => navigate(getValues('address'))}>Query</Button>
      <Divider />
      <Text>- OR -</Text>
      <Link to="/actions" style={{ textDecorationLine: 'underline' }}>
        See all actions that happened
      </Link>
      <Text>- OR -</Text>
      <Heading size="lg">Overview</Heading>
      <Divider m="2" />
      <PositionsTable />
    </Flex>
  );
}

export default App;
