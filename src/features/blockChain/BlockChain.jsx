import React from 'react';

import Block from './components/Block/Block';
import DownChevron from './components/DownChevron/DownChevron';

import { BlockChainContainer } from './BlockChainStyles';

const BlockChain = () => {
	return (
		<BlockChainContainer>
			<Block
				index={0}
				previousHash={
					'000f644f33d5073884cd8dde9e7011776c5b23436d98731fb8cd537960b6858b'
				}
				timeStamp={'2021-09-06T14:20:27.462Z'}
				// timeStamp={'Mon, 06 Sep 2021 12:46:14 GMT'}
				nonce={2142}
			/>
			<DownChevron />
			<Block
				index={1}
				previousHash={
					'000f644f33d5073884cd8dde9e7011776c5b23436d98731fb8cd537960b6858b'
				}
				timeStamp={'2021-09-06T14:20:27.462Z'}
				// timeStamp={'Mon, 06 Sep 2021 12:46:14 GMT'}
				nonce={2142}
			/>
		</BlockChainContainer>
	);
};

export default BlockChain;
