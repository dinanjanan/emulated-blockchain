import React from 'react';
import { useDispatch } from 'react-redux';

import CircleAvatar from '../CircleAvatar/CircleAvatar';
import Paragraph from '../../../../components/Paragraph/Paragraph';

import {
	PeerAvatarContainer,
	PeerOptions,
	PeerOption,
} from './PeerAvatar.styles';
import { ConnectionStates } from '../../../../app/constants';
import { removePeer } from '../../../blockChain/blockChain.slice';

const PeerAvatar = ({ connectionState, name, peerId }) => {
	const dispatch = useDispatch();

	let connectOptionHoverColor;
	switch (connectionState) {
		case ConnectionStates.connected:
		case ConnectionStates.currentlyActive:
			connectOptionHoverColor = ConnectionStates.disconnected.color;
			break;
		case ConnectionStates.disconnected:
			connectOptionHoverColor = ConnectionStates.connected.color;
			break;
		default:
			// Default to the color of the current connection state. This code should be unreachable.
			connectOptionHoverColor = connectionState.color;
	}

	const onRemovePeerClicked = () => dispatch(removePeer({ peerId }));

	return (
		<PeerAvatarContainer color={connectionState.color} isSelected>
			<span className="circle-avatar__container">
				<CircleAvatar connectionState={connectionState} />
				<span className="circle-avatar__cross" onClick={onRemovePeerClicked}>
					&#215;
				</span>
			</span>
			<Paragraph style={{ textOverflow: 'ellipsis' }}>{name}</Paragraph>
			<PeerOptions>
				<PeerOption hoverColor={connectOptionHoverColor}>
					<i className="fas fa-link" />
				</PeerOption>
				<PeerOption hoverColor={ConnectionStates.connected.color}>
					<i className="far fa-comment-dots" />
				</PeerOption>
			</PeerOptions>
		</PeerAvatarContainer>
	);
};

export default PeerAvatar;

// TODO - Implement the 'connect' and 'view history' buttons under each peer, each with
// the correct visibility (i.e., 'view history' must only be available when the peer is connected)

// TODO - Implement scrolling through the peers list.

// TODO - Implement loading the blockchain for the new active peer when one of the peer avatars is clicked, as that
// peer will become the new active peer.

// TODO - Implement the blockchain p2p algorithm.
