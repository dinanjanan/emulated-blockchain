import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import BlockChain from './features/blockChain/BlockChain';
import AddNewBlock from './features/blockChain/components/AddNewBlock/AddNewBlock';
import PeersDisplay from './features/peerNetwork/PeersDisplay';

import Logo from './components/Logo/Logo';
import Title from './components/Title/Title';
import Credits from './components/Credits/Credits';

import {
	selectBlockChainSetUpState,
	fetchPeerData,
} from './features/blockChain/blockChain.slice';
import { OperationStates } from './app/constants';

import { AppContainer } from './styles/App.styles';
import { GlobalStyles } from './styles/Global.styles';

function App() {
	const blockChainSetUpState = useSelector(selectBlockChainSetUpState);
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(fetchPeerData());
	}, [dispatch]);

	if (blockChainSetUpState === OperationStates.pending) {
		return <h2>Loading...</h2>;
	} else if (blockChainSetUpState === OperationStates.failed) {
		return <h2>An error occurred.</h2>;
	}

	return (
		<AppContainer>
			<GlobalStyles />
			<Logo />
			<PeersDisplay />
			<Title heading>BLOCKCHAIN</Title>
			<BlockChain />
			<AddNewBlock />
			<Credits />
		</AppContainer>
	);
}

export default App;
