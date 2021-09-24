import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';

import CircleAvatar from '../CircleAvatar/CircleAvatar';
import Paragraph from '../../../../components/Paragraph/Paragraph';

import { ConnectionStates } from '../../../../app/constants';
import {
  removePeer,
  selectPeerCount,
  connectWithPeer,
  selectActivePeerId,
} from '../../../blockchain/blockchain.slice';

import {
  PeerAvatarContainer,
  PeerOptions,
  PeerOption,
} from './PeerAvatar.styles';

type PeerAvatarProps = {
  connectionState: typeof ConnectionStates[keyof typeof ConnectionStates];
  name: string;
  peerId: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  forwardedRef?: React.ForwardedRef<HTMLDivElement>;
};

const PeerAvatar: React.FC<PeerAvatarProps> = ({
  connectionState,
  name,
  peerId,
  onClick,
  forwardedRef,
}) => {
  const dispatch = useAppDispatch();

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

  const numPeers = useAppSelector(selectPeerCount);
  const activePeerId = useAppSelector(selectActivePeerId);

  const onRemovePeerClicked: React.MouseEventHandler = e => {
    // Prevent event from propagating back up so that nothing happens if any parent elements
    // need to do something which requires this component to be rendered.
    e.stopPropagation();

    console.log('numPeers:', numPeers);
    if (numPeers > 1) dispatch(removePeer({ peerId }));
    else
      console.log(
        '[WARN] Cannot remove peer. Only one peer exists in the application.',
      );
  };

  const onConnectWithPeerClicked: React.MouseEventHandler = e => {
    e.stopPropagation();
    dispatch(connectWithPeer(peerId));
  };

  return (
    <PeerAvatarContainer
      ref={forwardedRef}
      color={connectionState.color}
      isSelected
      onClick={onClick}
    >
      <span className="circle-avatar__container">
        <CircleAvatar connectionState={connectionState} />
        <span className="circle-avatar__cross" onClick={onRemovePeerClicked}>
          &#215;
        </span>
      </span>
      <Paragraph style={{ textOverflow: 'ellipsis' }}>{name}</Paragraph>
      <PeerOptions>
        {peerId !== activePeerId ? (
          <PeerOption
            hoverColor={connectOptionHoverColor}
            onClick={onConnectWithPeerClicked}
          >
            <i className="fas fa-link" />
          </PeerOption>
        ) : null}

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
