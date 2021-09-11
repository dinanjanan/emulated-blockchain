import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Title from '../../components/Title/Title';
import PeerAvatar from './components/PeerAvatar/PeerAvatar';

import { ConnectionStates } from '../../app/constants';
import { fetchPeerData, selectAllPeers } from '../blockChain/blockChain.slice';

import {
	PeersDisplayContainer,
	PeersList,
	PeersListContainer,
	AddPeerButton,
} from './PeersDisplay.styles';

const PeersDisplay = () => {
	const dispatch = useDispatch();

	const peers = useSelector(selectAllPeers);
	console.log('peers:', peers);

	const onAddPeerClicked = () => {
		dispatch(fetchPeerData());
	};

	return (
		<PeersDisplayContainer>
			<Title>PEERS</Title>
			<span className="peers-list-ops__container">
				<PeersListContainer>
					<i className="fas fa-chevron-left" />
					<PeersList>
						{peers.map(peer => (
							<PeerAvatar
								key={peer.id}
								connectionState={ConnectionStates.currentlyActive}
								name={peer.name}
								peerId={peer.id}
							/>
						))}
					</PeersList>
					<i className="fas fa-chevron-right" />
				</PeersListContainer>
				<AddPeerButton onClick={onAddPeerClicked}>Add Peer</AddPeerButton>
			</span>
		</PeersDisplayContainer>
	);
};

export default PeersDisplay;
