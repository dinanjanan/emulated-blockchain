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
import Credits from './components/Credits/Credits';

import { AppContainer } from './styles/App.styles';
import { GlobalStyles } from './styles/Global.styles';

function App() {
  const blockchainSetUpState = useAppSelector(selectBlockChainSetUpState);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const dispatchInOrder = async () => {
      await dispatch(fetchPeerData()).unwrap();
      dispatch(mineBlock('Welcome to Blockchain Demo 2.0!'));

      // Trigger mining of the genesis block
      // blockchainSlice.caseReducers.mineBlock(state, {
      //   payload: 'Welcome to Blockchain Demo 2.0!',
      // });
    };

    dispatchInOrder();
  }, [dispatch]);

  if (blockchainSetUpState === OperationStates.pending) {
    return <h2>Loading...</h2>;
  } else if (blockchainSetUpState === OperationStates.failed) {
    return <h2>An error occurred.</h2>;
  }

  return (
    <AppContainer>
      <GlobalStyles />
      <Logo />
      <PeersDisplay />
      <Title heading>BLOCKCHAIN</Title>
      <BlockChainDisplay />
      <AddNewBlock />
      <Credits />
    </AppContainer>
  );
}

export default App;
