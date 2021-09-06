import React from 'react';

import Input from '../../../../components/Input/Input';
import PreviousHash from '../PreviousHash/PreviousHash';
import CurrentHash from '../CurrentHash/CurrentHash';
import BlockDescription from '../BlockDescription/BlockDescription';
import BlockNonce from '../BlockNonce/BlockNonce';

import { BlockContainer, BlockFooter } from './BlockStyles';

const Block = ({ index, previousHash, timeStamp, nonce }) => {
	return (
		<BlockContainer>
			<Input labelText="DATA" placeholder="Welcome to Blockchain Demo 2.0!" />
			<PreviousHash previousHash={previousHash} />
			<CurrentHash
				hash={
					'000f644f33d5073884cd8dde9e7011776c5b23436d98731fb8cd537960b6858b'
				}
			/>
			<BlockFooter>
				<BlockDescription {...{ index, timeStamp }}></BlockDescription>
				<BlockNonce nonce={nonce} />
			</BlockFooter>
		</BlockContainer>
	);
};

export default Block;
