import React from 'react';

import Block from './components/Block/Block';
import DownChevron from './components/DownChevron/DownChevron';

import { useAppSelector } from '../../app/hooks';
import { selectActivePeerBlockChain } from './blockchain.slice';

import {
  BlockChainDisplayContainer,
  BlockWithChevron,
} from './BlockChainDisplay.styles';

const BlockChainDisplay: React.FC<{}> = () => {
  const blocks = useAppSelector(selectActivePeerBlockChain);

  if (!blocks) {
    console.log('No blockchain');
    return null;
  }

  console.log('blocks:', blocks);

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
