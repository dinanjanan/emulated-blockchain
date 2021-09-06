import React from 'react';

import BlockChain from './features/blockChain/BlockChain';
import AddNewBlock from './features/addNewBlock/AddNewBlock';
import Logo from './components/Logo/Logo';

import { Title, AppContainer } from './Styles/AppStyles';
import { GlobalStyles } from './Styles/GlobalStyles';

function App() {
	return (
		<AppContainer>
			<GlobalStyles />
			<Logo />
			<Title>BLOCKCHAIN</Title>
			<BlockChain />
			<AddNewBlock />
		</AppContainer>
	);
}

export default App;
