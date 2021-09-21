import React from 'react';

import Block from './components/Block/Block';
import DownChevron from './components/DownChevron/DownChevron';

import { useAppSelector } from '../../app/hooks';
import { selectAllBlocksForCurrentPeer } from './blockChain.slice';

import {
  BlockChainDisplayContainer,
  BlockWithChevron,
} from './BlockChainDisplay.styles';

const BlockChainDisplay: React.FC<{}> = () => {
  const blocks = useAppSelector(selectAllBlocksForCurrentPeer);

  const renderedBlocks = blocks.map((block, i) => {
    return (
      <BlockWithChevron key={block.index}>
        <Block {...block} />
        {i === blocks.length - 1 ? null : <DownChevron />}
      </BlockWithChevron>
    );
  });

  return (
    <BlockChainDisplayContainer>{renderedBlocks}</BlockChainDisplayContainer>
  );
};

export default BlockChainDisplay;
