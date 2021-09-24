import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';

import Title from '../../components/Title/Title';
import PeerAvatar from './components/PeerAvatar/PeerAvatar';

import { ConnectionStates } from '../../app/constants';
import {
  fetchPeerData,
  selectAllPeers,
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
  console.log('peers:', peers);

  const [peersListWidth, setPeersListWidth] = useState(0);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [leftArrowVisible, setLeftArrowVisible] = useState(false);
  const [rightArrowVisible, setRightArrowVisible] = useState(false);

  const peersListRef = useRef<HTMLDivElement>(null);
  const firstPeerRef = useRef<HTMLDivElement>(null);
  const leftArrowRef = useRef<HTMLDivElement>(null);
  const rightArrowRef = useRef<HTMLDivElement>(null);
  const endPaddingRef = useRef<HTMLDivElement>(null);

  const peerAvatarWidth: number =
    (firstPeerRef.current?.getBoundingClientRect().width ?? 71) + 52;

  const closestCeilMultiple = (x: number, divisor: number): number => {
    let num = Math.ceil(x);

    while (num % divisor) {
      num++;
    }

    return num;
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentBoxSize) {
          const contentBoxSize: ResizeObserverSize = Array.isArray(
            entry.contentBoxSize,
          )
            ? entry.contentBoxSize[0]
            : entry.contentBoxSize;

          console.log('RESIZE OBSERVER');
          setPeersListWidth(contentBoxSize.inlineSize);
        }
      }
    });

    resizeObserver.observe(peersListRef.current!);
  }, []);

  useLayoutEffect(() => {
    if (peersListRef.current && endPaddingRef.current) {
      // const elementsPerSlide = Math.floor(
      //   peersListRef.current.getBoundingClientRect().width / peerAvatarWidth,
      // );
      const elementsPerSlide =
        peersListRef.current.getBoundingClientRect().width / peerAvatarWidth;
      const numSlides = Math.ceil(peers.length / elementsPerSlide);
      // const padding = (peers.length % elementsPerSlide) * peerAvatarWidth;
      const padding =
        (closestCeilMultiple(peers.length, Math.ceil(elementsPerSlide)) -
          peers.length) *
        peerAvatarWidth;

      console.log(
        'padding',
        padding,
        peersListRef.current.getBoundingClientRect().width,
        currentSlide,
      );
      // endPaddingRef.current.style.paddingRight = `${padding}px`;
      console.log('numSlides', numSlides);

      if (
        peersListRef.current &&
        leftArrowRef.current &&
        rightArrowRef.current
      ) {
        if (peers.length <= Math.floor(elementsPerSlide)) {
          leftArrowRef.current.style.visibility = 'hidden';
          rightArrowRef.current.style.visibility = 'hidden';
        } else if (currentSlide === 0) {
          leftArrowRef.current.style.visibility = 'hidden';
          rightArrowRef.current.style.visibility = 'visible';
        } else if (currentSlide === numSlides - 1) {
          leftArrowRef.current.style.visibility = 'visible';
          rightArrowRef.current.style.visibility = 'hidden';
        } else {
          leftArrowRef.current.style.visibility = 'visible';
          rightArrowRef.current.style.visibility = 'visible';
        }
      }
    }
  });

  const scrollToSlide = (slide: number) => {
    if (peersListRef.current && endPaddingRef.current) {
      const elementsPerSlide =
        peersListRef.current.getBoundingClientRect().width / peerAvatarWidth;

      const numSlides = Math.ceil(peers.length / elementsPerSlide);
      console.log('peerAvatarWidth', peerAvatarWidth);
      console.log('elements', elementsPerSlide);
      console.log('numSlides', numSlides);
      console.log(
        'peersListWidth',
        peersListRef.current.getBoundingClientRect().width,
      );

      console.log('scrollTo', slide);

      if (slide === 0) setLeftArrowVisible(false);
      if (slide === numSlides - 1) setRightArrowVisible(false);

      peersListRef.current?.scrollTo({
        left: slide * peersListRef.current.getBoundingClientRect().width,
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const onLeftArrowClicked = () => {
    setCurrentSlide(prevSlide => {
      let nextSlide: number = prevSlide - 1;

      if (peersListRef.current && endPaddingRef.current) {
        const elementsPerSlide =
          peersListRef.current.getBoundingClientRect().width / peerAvatarWidth;

        const numSlides = Math.ceil(peers.length / elementsPerSlide);

        if (prevSlide === 0) {
          nextSlide = numSlides - 1;
        }
      }
      console.log('ns', nextSlide);

      scrollToSlide(nextSlide);

      return nextSlide;
    });
  };

  const onRightArrowClicked = () => {
    setCurrentSlide(prevSlide => {
      let nextSlide: number = prevSlide + 1;

      if (peersListRef.current && endPaddingRef.current) {
        const elementsPerSlide =
          peersListRef.current.getBoundingClientRect().width / peerAvatarWidth;

        const numSlides = Math.ceil(peers.length / elementsPerSlide);
        console.log(numSlides, prevSlide);
        if (prevSlide > numSlides || prevSlide === numSlides - 1) {
          nextSlide = 0;
        }
      }

      scrollToSlide(nextSlide);

      return nextSlide;
    });
  };

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
            onClick={onLeftArrowClicked}
            style={{ visibility: leftArrowVisible ? 'visible' : 'hidden' }}
          >
            <i className="fas fa-chevron-left" />
          </SideChevronContainer>
          <PeersList ref={peersListRef}>
            {peers.map((peer, i) => {
              return (
                <PeerAvatar
                  key={peer.id}
                  forwardedRef={i === 0 ? firstPeerRef : null}
                  connectionState={ConnectionStates.currentlyActive}
                  name={peer.name}
                  peerId={peer.id}
                  onClick={() => onPeerAvatarClicked(peer.id)}
                />
              );
            })}
            <div ref={endPaddingRef} style={{ backgroundColor: 'red' }} />
          </PeersList>
          <SideChevronContainer
            ref={rightArrowRef}
            onClick={onRightArrowClicked}
            style={{ visibility: rightArrowVisible ? 'visible' : 'hidden' }}
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
