import React from 'react';
import { ConnectionStates } from '../../app/constants';

import Title from '../../components/Title/Title';
import PeerAvatar from './components/PeerAvatar/PeerAvatar';

import {
	PeersDisplayContainer,
	PeersList,
	AddPeerButton,
} from './PeersDisplay.styles';

const PeersDisplay = () => {
	const onAddPeerClicked = () => {};

	return (
		<PeersDisplayContainer>
			<Title>PEERS</Title>
			<span className="peers-list-ops__container">
				<PeersList>
					<PeerAvatar
						connectionState={ConnectionStates.currentlyActive}
						name="Satoshi"
					/>
					<PeerAvatar
						connectionState={ConnectionStates.connected}
						name="Erin"
					/>
				</PeersList>
				<AddPeerButton onClick={onAddPeerClicked}>Add Peer</AddPeerButton>
			</span>
		</PeersDisplayContainer>
	);
};

export default PeersDisplay;
