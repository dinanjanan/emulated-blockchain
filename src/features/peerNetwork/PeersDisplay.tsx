import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';

import Title from '../../components/Title/Title';
import PeerAvatar from './components/PeerAvatar/PeerAvatar';

import { ConnectionStates } from '../../app/constants';
import {
  fetchPeerData,
  selectAllPeers,
  selectActivePeer,
  setActivePeer,
} from '../blockchain/blockchain.slice';

import {
  PeersDisplayContainer,
  PeersList,
  PeersListContainer,
  AddPeerButton,
  SideChevronContainer,
} from './PeersDisplay.styles';

const PeersDisplay: React.FC = () => {
  const dispatch = useAppDispatch();

  const peers = useAppSelector(selectAllPeers);
  const activePeer = useAppSelector(selectActivePeer)!;
  // console.log('peers:', peers);

  const [prevPeersLength, setPrevPeersLength] = useState(peers.length);
  const [, setPeersListWidth] = useState(0);
  const [, setCurrElIdx] = useState(0);
  const [peerAvatarWidth, setPeerAvatarWidth] = useState(0);

  const peersListRef = useRef<HTMLDivElement>(null);
  const firstPeerRef = useRef<HTMLDivElement>(null);
  const leftArrowRef = useRef<HTMLDivElement>(null);
  const rightArrowRef = useRef<HTMLDivElement>(null);

  const calculateElementsPerSlide = useCallback(() => {
    return Math.floor(
      peersListRef.current!.getBoundingClientRect().width / peerAvatarWidth,
    );
  }, [peerAvatarWidth]);

  const scrollToPeerAvatar = useCallback(
    (idx: number) => {
      peersListRef.current?.scrollTo({
        left: idx * peerAvatarWidth,
        top: 0,
        behavior: 'smooth',
      });
    },
    [peerAvatarWidth],
  );

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentBoxSize) {
          // Firefox uses an array
          const contentBoxSize: ResizeObserverSize = Array.isArray(
            entry.contentBoxSize,
          )
            ? entry.contentBoxSize[0]
            : entry.contentBoxSize;

          // Force a re-render
          setPeersListWidth(contentBoxSize.inlineSize);
        }
      }
    });

    // Calculate the peer avatar width after mounting
    setPeerAvatarWidth(
      (firstPeerRef.current?.getBoundingClientRect().width ?? 70) + 52,
    );

    resizeObserver.observe(peersListRef.current!);
  }, []);

  useEffect(() => {
    // If the peers list has changed (i.e., if a peer was added or removed)
    if (peers.length !== prevPeersLength) {
      setPrevPeersLength(peers.length);
    }
    if (peers.length > prevPeersLength && peersListRef.current) {
      scrollToPeerAvatar(peers.length - 1);
    }
  }, [
    scrollToPeerAvatar,
    setPrevPeersLength,
    peersListRef,
    peers,
    prevPeersLength,
  ]);

  const calculateNextIdx = useCallback(
    (prevIdx: number, direction: 'right' | 'left'): number => {
      let idx = 0;
      if (peersListRef.current) {
        const elementsPerSlide = calculateElementsPerSlide();

        let temp;
        if (direction === 'right') {
          temp = prevIdx + elementsPerSlide;
        } else {
          temp = prevIdx - elementsPerSlide;
        }

        if (temp > peers.length) {
          idx = peers.length - 1;
        } else {
          idx = temp > 0 ? temp : 0;
        }
      }

      return idx;
    },
    [peers, calculateElementsPerSlide],
  );

  const onArrowClicked = useCallback(
    (direction: 'left' | 'right') => {
      setCurrElIdx(prevIdx => {
        const idx = calculateNextIdx(prevIdx, direction);
        scrollToPeerAvatar(idx);

        return idx;
      });
    },
    [setCurrElIdx, scrollToPeerAvatar, calculateNextIdx],
  );

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
          <SideChevronContainer
            ref={leftArrowRef}
            onClick={() => onArrowClicked('left')}
          >
            <i className="fas fa-chevron-left" />
          </SideChevronContainer>
          <PeersList ref={peersListRef}>
            {peers.map((peer, i) => {
              return (
                <PeerAvatar
                  key={peer.id}
                  forwardedRef={i === 0 ? firstPeerRef : null}
                  connectionState={
                    activePeer.id === peer.id
                      ? ConnectionStates.currentlyActive
                      : activePeer.connectedPeers.findIndex(
                          peerConn => peerConn.peerId === peer.id,
                        ) !== -1
                      ? ConnectionStates.connected
                      : ConnectionStates.disconnected
                  }
                  name={peer.name}
                  peerId={peer.id}
                  onClick={() => onPeerAvatarClicked(peer.id)}
                />
              );
            })}
          </PeersList>
          <SideChevronContainer
            ref={rightArrowRef}
            onClick={() => onArrowClicked('right')}
          >
            <i className="fas fa-chevron-right" />
          </SideChevronContainer>
        </PeersListContainer>
        <AddPeerButton onClick={onAddPeerClicked}>Add Peer</AddPeerButton>
      </span>
    </PeersDisplayContainer>
  );
};

export default PeersDisplay;
