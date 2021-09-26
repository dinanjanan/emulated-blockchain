import React, { useEffect } from 'react';

import {
  selectBlockChainSetUpState,
  fetchPeerData,
  mineBlock,
} from './features/blockchain/blockchain.slice';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { OperationStates } from './app/constants';

import BlockChainDisplay from './features/blockchain/BlockChainDisplay';
import AddNewBlock from './features/blockchain/components/AddNewBlock/AddNewBlock';
import PeersDisplay from './features/peerNetwork/PeersDisplay';

import Logo from './components/Logo/Logo';
import Title from './components/Title/Title';

import { AppContainer } from './styles/App.styles';
import Paragraph from './components/Paragraph/Paragraph';

function App() {
  const blockchainSetUpState = useAppSelector(selectBlockChainSetUpState);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const dispatchInOrder = async () => {
      await dispatch(fetchPeerData()).unwrap();
      dispatch(mineBlock('Welcome to Blockchain Demo 2.0!'));
    };

    dispatchInOrder();
  }, [dispatch]);

  if (blockchainSetUpState === OperationStates.pending) {
    return <div />;
  } else if (blockchainSetUpState === OperationStates.failed) {
    return (
      <Paragraph
        style={{
          position: 'absolute',
          top: '50vh',
          left: '50vw',
          transform: 'translate(-50%, -50%)',
        }}
      >
        An error occurred. Please try reloading the page. <br /> If that doesn't
        work, you may have lost your connection to the internet...
      </Paragraph>
    );
  }

  return (
    <AppContainer>
      <Logo />
      <PeersDisplay />
      <Title heading>BLOCKCHAIN</Title>
      <BlockChainDisplay />
      <AddNewBlock />
    </AppContainer>
  );
}

export default App;
