import React from 'react';
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
  SideChevronContainer,
} from './PeersDisplay.styles';

const PeersDisplay: React.FC<{}> = () => {
  const dispatch = useDispatch();

  const peers = useSelector(selectAllPeers);
  console.log('peers:', peers);

  const onAddPeerClicked = () => {
    dispatch(fetchPeerData());
  };

  const onPeerAvatarClicked = (peerId: string) => {
    dispatch(setActivePeer(peerId));
  };

  return (
    <PeersDisplayContainer>
      <Title>PEERS</Title>
      <span className="peers-list-ops__container">
        <PeersListContainer>
          <SideChevronContainer>
            <i className="fas fa-chevron-left" />
          </SideChevronContainer>
          <PeersList>
            {peers.map((peer, index) => {
              return (
                <PeerAvatar
                  key={peer.id}
                  connectionState={ConnectionStates.currentlyActive}
                  name={peer.name}
                  peerId={peer.id}
                  onClick={() => onPeerAvatarClicked(peer.id)}
                />
              );
            })}
          </PeersList>
          <SideChevronContainer>
            <i className="fas fa-chevron-right" />
          </SideChevronContainer>
        </PeersListContainer>
        <AddPeerButton onClick={onAddPeerClicked}>Add Peer</AddPeerButton>
      </span>
    </PeersDisplayContainer>
  );
};

export default PeersDisplay;
