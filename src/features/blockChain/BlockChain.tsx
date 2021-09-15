import React from 'react';

import Block from './components/Block/Block';
import DownChevron from './components/DownChevron/DownChevron';

import { useAppSelector } from '../../app/hooks';
import { selectAllBlocksForCurrentPeer } from './blockChain.slice';

import { BlockChainContainer, BlockWithChevron } from './BlockChain.styles';

const BlockChain: React.FC<{}> = () => {
  const blocks = useAppSelector(selectAllBlocksForCurrentPeer);

  const renderedBlocks = blocks.map((block, i) => {
    return (
      <BlockWithChevron key={block.index}>
        <Block {...block} />
        {i === blocks.length - 1 ? null : <DownChevron />}
      </BlockWithChevron>
    );
  });

  return <BlockChainContainer>{renderedBlocks}</BlockChainContainer>;
};

export default BlockChain;
