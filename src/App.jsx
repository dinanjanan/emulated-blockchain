import React from 'react';

import BlockChain from './features/blockChain/BlockChain';
import AddNewBlock from './features/blockChain/components/AddNewBlock/AddNewBlock';

import Logo from './components/Logo/Logo';
import Title from './components/Title/Title';

import { AppContainer } from './styles/App.styles';
import { GlobalStyles } from './styles/Global.styles';

function App() {
	return (
		<AppContainer>
			<GlobalStyles />
			<Logo />
			<Title heading>BLOCKCHAIN</Title>
			<BlockChain />
			<AddNewBlock />
		</AppContainer>
	);
}

export default App;
