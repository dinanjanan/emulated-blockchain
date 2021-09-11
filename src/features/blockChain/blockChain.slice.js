import {
	createSlice,
	createEntityAdapter,
	createAsyncThunk,
	createSelector,
} from '@reduxjs/toolkit';

import { computeHash, generateBlock } from './utils';
import { OperationStates } from '../../app/constants';

const blockChainAdapter = createEntityAdapter({
	selectId: block => block.index,
	sortComparer: (a, b) => a - b,
});

const initialState = blockChainAdapter.getInitialState({
	currentlyActivePeer: '',
	setUpState: OperationStates.pending,
});

export const fetchPeerData = createAsyncThunk(
	'peers/fetchPeerData',
	async () => {
		const res = await fetch('https://randomuser.me/api/?inc=name,login');
		const data = await res.json();

		return {
			name: data.results[0].name.first,
			id: data.results[0].login.uuid,
		};
	}
);

const blockChainSlice = createSlice({
	name: 'blockChain',
	initialState,
	reducers: {
		removePeer(state, { payload: { peerId } }) {
			const peerIds = Object.keys(state.entities);
			const peerEntities = peerIds
				.filter(id => id !== peerId)
				.map(id => state.entities[id]);

			delete state.entities[peerId].blockChain;
			delete state.entities[peerId];

			state.entities = {};
			peerEntities.forEach(peer => (state.entities[peer.id] = peer));

			state.currentlyActivePeer = peerIds[peerIds.indexOf(peerId) - 1];
		},
		mineBlock(state, { payload: data }) {
			console.log('current peer:', state.currentlyActivePeer);
			const currentBlockChain =
				state.entities[state.currentlyActivePeer].blockChain;
			const previousBlock = Object.values(currentBlockChain).at(-1);

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
					index: Object.keys(currentBlockChain).length,
					data,
					previousHash: previousBlock?.hash,
				});
			}

			// blockChainAdapter.addOne(state, block);
			currentBlockChain[block.index] = block;
			console.log(`Added block #${block.index}`, state, block);
		},
		reMineBlock(state, { payload: { data, previousHash, index } }) {
			const currentBlockChain =
				state.entities[state.currentlyActivePeer].blockChain;
			const block = generateBlock({ index, data, previousHash });

			if (index < Object.keys(currentBlockChain).length - 1) {
				currentBlockChain[index + 1].previousHash = block.hash;
			}
			// blockChainAdapter.upsertOne(state, block);
			currentBlockChain[index] = block;
		},
		updateLatestBlockHashes(state, { payload: { invalidIndex, newData } }) {
			const currentBlockChain =
				state.entities[state.currentlyActivePeer].blockChain;
			const invalidatorBlock = currentBlockChain[invalidIndex];

			const invalidBlocks = Object.values(currentBlockChain).filter(
				block => block.index >= invalidIndex
			);

			invalidatorBlock.data = newData;
			const updatedBlocks = invalidBlocks.map((block, i) => {
				if (i > 0) block.previousHash = invalidBlocks.at(i - 1).hash;
				const { index, data, timeStamp, previousHash, nonce } = block;
				block.hash = computeHash(index, data, timeStamp, previousHash, nonce);

				return block;
			});

			// blockChainAdapter.updateMany(state, updatedBlocks);
			updatedBlocks.forEach(block => (currentBlockChain[block.index] = block));
		},
	},
	extraReducers: builder => {
		builder
			.addCase(fetchPeerData.pending, (state, action) => {
				console.log('fetching peer data');
			})
			.addCase(fetchPeerData.rejected, (state, action) => {
				console.log('error fetching peer data', action.payload);

				state.setUpState = OperationStates.failed;
			})
			.addCase(fetchPeerData.fulfilled, (state, { payload }) => {
				// Set-up the blockChain for this peer.
				state.entities[payload.id] = {
					id: payload.id,
					name: payload.name,
					blockChain: {},
				};

				state.currentlyActivePeer = payload.id;

				// Trigger mining of the genesis block
				blockChainSlice.caseReducers.mineBlock(state, {
					payload: 'Welcome to Blockchain Demo 2.0!',
				});

				// Acknowloedge of the app that the blockchain has been setup.
				state.setUpState = OperationStates.complete;

				console.log('The current peer has been set');
			});
	},
});

// Selectors
const selectBlockChainSlice = state => state.blockChain;

export const selectActivePeer = createSelector(
	[selectBlockChainSlice],
	blockChain => blockChain.currentlyActivePeer
);
export const selectActivePeerBlockChain = createSelector(
	[selectBlockChainSlice],
	peers => peers.entities[peers.currentlyActivePeer].blockChain
);

export const selectBlockIndexes = createSelector(
	[selectActivePeerBlockChain],
	blockChain => Object.keys(blockChain)
);

export const selectAllBlocksForCurrentPeer = createSelector(
	[selectActivePeerBlockChain],
	blockChain => Object.values(blockChain)
);

export const selectBlockByIndexForCurrentPeer = index =>
	createSelector([selectActivePeerBlockChain], blockChain => blockChain[index]);

export const selectBlockChainSetUpState = createSelector(
	[selectBlockChainSlice],
	blockChain => blockChain.setUpState
);

export const selectAllPeers = createSelector(
	[selectBlockChainSlice],
	blockChain => Object.values(blockChain.entities)
);

// Actions
export const { mineBlock, reMineBlock, updateLatestBlockHashes, removePeer } =
	blockChainSlice.actions;

// Reducer
export default blockChainSlice.reducer;
