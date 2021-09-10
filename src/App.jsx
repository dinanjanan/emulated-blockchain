import React from 'react';

import BlockChain from './features/blockChain/BlockChain';
import AddNewBlock from './features/blockChain/components/AddNewBlock/AddNewBlock';
import PeersDisplay from './features/peerNetwork/PeersDisplay';

import Logo from './components/Logo/Logo';
import Title from './components/Title/Title';
import Credits from './components/Credits/Credits';

import { AppContainer } from './styles/App.styles';
import { GlobalStyles } from './styles/Global.styles';

function App() {
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
