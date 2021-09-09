import React from 'react';
import { useSelector } from 'react-redux';

import Block from './components/Block/Block';
import DownChevron from './components/DownChevron/DownChevron';

import { selectAllBlocks } from './blockChain.slice';

import { BlockChainContainer, BlockWithChevron } from './BlockChain.styles';

const BlockChain = () => {
	const blocks = useSelector(selectAllBlocks);

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
