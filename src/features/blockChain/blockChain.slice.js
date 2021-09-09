import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { computeHash, generateBlock } from './utils';

const blockChainAdapter = createEntityAdapter({
	selectId: block => block.index,
	sortComparer: (a, b) => a - b,
});

const initialState = blockChainAdapter.getInitialState();

const blockChainSlice = createSlice({
	name: 'blockChain',
	initialState,
	reducers: {
		mineBlock(state, { payload: data }) {
			const previousBlock = Object.values(state.entities).at(-1);

			console.log('previousBlock', previousBlock);
			let block;

			if (!previousBlock) {
				// Genesis block
				// Previous block hash is zero
				block = generateBlock({
					index: 0,
					data,
					previousHash: '0',
				});
			} else {
				// Mine the block using the previous block's hash as well
				block = generateBlock({
					index: state.ids.length,
					data,
					previousHash: previousBlock?.hash,
				});
			}

			blockChainAdapter.addOne(state, block);
			console.log(`Added block #${block.index}`, state, block);
		},
		reMineBlock(state, { payload: { data, previousHash, index } }) {
			const block = generateBlock({ index, data, previousHash });

			if (index < state.ids.length - 1) {
				state.entities[index + 1].previousHash = block.hash;
			}
			blockChainAdapter.upsertOne(state, block);
		},
		updateLatestBlockHashes(state, { payload: { invalidIndex, newData } }) {
			const invalidatorBlock = state.entities[invalidIndex];

			const invalidBlocks = Object.values(state.entities).filter(
				block => block.index >= invalidIndex
			);

			invalidatorBlock.data = newData;
			const updatedBlocks = invalidBlocks.map((block, i) => {
				if (i > 0) block.previousHash = invalidBlocks.at(i - 1).hash;
				const { index, data, timeStamp, previousHash, nonce } = block;
				block.hash = computeHash(index, data, timeStamp, previousHash, nonce);

				return block;
			});

			blockChainAdapter.updateMany(state, updatedBlocks);
		},
	},
});

export const { mineBlock, reMineBlock, updateLatestBlockHashes } =
	blockChainSlice.actions;

export const {
	selectIds: selectBlockIndexes,
	selectAll: selectAllBlocks,
	selectEntities: selectBlocks,
	selectById: selectBlockByIndex,
} = blockChainAdapter.getSelectors(state => state.blockChain);

export default blockChainSlice.reducer;
