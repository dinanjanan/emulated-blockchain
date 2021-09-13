import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Title from '../../components/Title/Title';
import PeerAvatar from './components/PeerAvatar/PeerAvatar';

import { ConnectionStates } from '../../app/constants';
import {
  fetchPeerData,
  selectAllPeers,
  setActivePeer,
} from '../blockChain/blockChain.slice';

import {
  PeersDisplayContainer,
  PeersList,
  PeersListContainer,
  AddPeerButton,
  PeersListAnimationContainer,
  SideChevronContainer,
} from './PeersDisplay.styles';

const PeersDisplay = () => {
  const dispatch = useDispatch();
  const [visiblePeers, setVisiblePeers] = useState({ lower: 0, upper: 2 });

  const peers = useSelector(selectAllPeers);
  console.log('peers:', peers);

  const onAddPeerClicked = () => {
    dispatch(fetchPeerData());
  };

  const onShiftRightClicked = () => {
    setVisiblePeers(prev => ({ lower: prev.lower + 1, upper: prev.upper + 1 }));
  };

  const onShiftLeftClicked = () => {};

  const onPeerAvatarClicked = peerId => {
    dispatch(setActivePeer(peerId));
  };

  return (
    <PeersDisplayContainer>
      <Title>PEERS</Title>
      <span className="peers-list-ops__container">
        <PeersListContainer>
          <SideChevronContainer onClick={onShiftLeftClicked}>
            <i className="fas fa-chevron-left" />
          </SideChevronContainer>
          <PeersListAnimationContainer>
            <PeersList>
              {peers.map((peer, index) => {
                console.log(
                  index,
                  index >= visiblePeers.lower && index <= visiblePeers.upper
                );
                return (
                  <PeerAvatar
                    key={peer.id}
                    connectionState={ConnectionStates.currentlyActive}
                    name={peer.name}
                    peerId={peer.id}
                    onClick={() => onPeerAvatarClicked(peer.id)}
                    visible={
                      index >= visiblePeers.lower && index <= visiblePeers.upper
                    }
                  />
                );
              })}
            </PeersList>
          </PeersListAnimationContainer>
          <SideChevronContainer onClick={onShiftRightClicked}>
            <i className="fas fa-chevron-right" />
          </SideChevronContainer>
        </PeersListContainer>
        <AddPeerButton onClick={onAddPeerClicked}>Add Peer</AddPeerButton>
      </span>
    </PeersDisplayContainer>
  );
};

export default PeersDisplay;
