import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
  createSelector,
} from '@reduxjs/toolkit';
import lodash from 'lodash';

import { computeHash, generateBlock, isValidHash } from './utils';
import { OperationStates } from '../../app/constants';

import type { RootState } from '../../index';
import type { Block, Peer, UnhashedBlock } from './interfaces/BlockChain';

type PeerFromAPI = Omit<Peer, 'blockChain'>;

type ExtendedBlockChainSliceState = {
  activePeer: string;
  setUpState: keyof typeof OperationStates;
};

const blockChainAdapter = createEntityAdapter<Peer>({
  selectId: peer => peer.id,
});

const initialState = blockChainAdapter.getInitialState({
  activePeer: '' as string,
  setUpState: OperationStates.pending,
} as ExtendedBlockChainSliceState);

/**
 * Creates a peer with a random name obtained from the [randomuser.me](https://randomuser.me) API.
 */
export const fetchPeerData = createAsyncThunk<PeerFromAPI>(
  'peers/fetchPeerData',
  async () => {
    const res = await fetch('https://randomuser.me/api/?inc=name,login');
    const {
      results: [{ name, login }],
    } = await res.json();

    return {
      name: name.first,
      id: login.uuid,
    } as PeerFromAPI;
  },
);

const blockChainSlice = createSlice({
  name: 'blockChain',
  initialState,
  reducers: {
    mineBlock(state, { payload: data }: { payload: string }) {
      console.log('current peer:', state.activePeer);
      const activeBlockChain = state.entities[state.activePeer]?.blockChain;

      if (!activeBlockChain) {
        console.error(
          `[ERROR] The active peer does not exist. Therefore, the active blockchain cannot be retrieved and the new block could not be mined.`,
        );

        return;
      }

      const previousBlock = Object.values(activeBlockChain).at(-1);

      console.log('previousBlock', previousBlock);
      let block: Block;

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
          index: Object.keys(activeBlockChain).length,
          data,
          previousHash: previousBlock?.hash,
        });
      }

      activeBlockChain[block.index] = block;
      console.log(`[INFO] Added block #${block.index}`);
    },
    reMineBlock(
      state,
      { payload: { data, previousHash, index } }: { payload: UnhashedBlock },
    ) {
      const activeBlockChain = state.entities[state.activePeer]?.blockChain;

      if (!activeBlockChain) {
        console.error(
          `[ERROR] The active peer does not exist. Therefore, the active blockchain cannot be retrieved and the invalidated block could not be re-mined.`,
        );

        return;
      }

      const block = generateBlock({ index, data, previousHash });

      if (index < Object.keys(activeBlockChain).length - 1) {
        activeBlockChain[index + 1].previousHash = block.hash;

        const { data, timeStamp, previousHash, nonce } =
          activeBlockChain[index + 1];
        activeBlockChain[index + 1].hash = computeHash(
          index + 1,
          data,
          timeStamp,
          previousHash,
          nonce,
        );
      }
      activeBlockChain[index] = block;

      console.log(`[INFO] Updated block #${block.index}`);
    },
    updateLatestBlockHashes(
      state,
      {
        payload: { invalidIndex, newData },
      }: { payload: { invalidIndex: number; newData: string } },
    ) {
      const activeBlockChain = state.entities[state.activePeer]?.blockChain;

      if (!activeBlockChain) {
        console.error(
          `[ERROR] The active peer does not exist. Therefore, the active blockchain cannot be retrieved and the block hashes could not be updated.`,
        );

        return;
      }

      const invalidatorBlock = activeBlockChain[invalidIndex];

      const invalidBlocks = Object.values(activeBlockChain).filter(
        block => block.index >= invalidIndex,
      );

      invalidatorBlock.data = newData;
      const updatedBlocks = invalidBlocks.map((block, i) => {
        if (i > 0) block.previousHash = invalidBlocks.at(i - 1)!.hash;
        const { index, data, timeStamp, previousHash, nonce } = block;
        block.hash = computeHash(index, data, timeStamp, previousHash, nonce);

        return block;
      });

      updatedBlocks.forEach(block => (activeBlockChain[block.index] = block));
    },
    removePeer(state, { payload }: { payload: { peerId: string } }) {
      // Update the ids array
      const idIdx = state.ids.indexOf(payload.peerId);
      if (idIdx >= 0) state.ids.splice(idIdx, 1);

      // Update the entities
      delete state.entities[payload.peerId];

      // Set the active peer
      state.activePeer = state.ids[idIdx - 1] as string;
    },
    setActivePeer(state, { payload: peerId }: { payload: string }) {
      console.log('active peer to set:', peerId);
      state.activePeer = peerId;
    },
    connectWithPeer(state, { payload: peerId }: { payload: string }) {
      // Get active peer blockchain
      let activeBlockChain = state.entities[state.activePeer]?.blockChain;

      if (!activeBlockChain) {
        console.error(
          `[ERROR] The active peer does not exist. Aborting connection with peer.`,
        );

        return;
      }

      // Connect with the peer
      const connectedPeer = state.entities[peerId];

      if (!connectedPeer) {
        // Handle connection failure
        console.error(
          `[ERROR] There was an issue connecting with peer #${peerId}`,
        );

        return;
      }

      // debugger;
      // while (!blockChainValidated) {
      // Retrieve the connected peer's and the active peer's latest block
      const peerLatestBlock = Object.values(connectedPeer.blockChain).at(-1);
      const activePeerLatestBlock = Object.values(activeBlockChain).at(-1);

      if (!peerLatestBlock || !activePeerLatestBlock) {
        // Both blockchains are empty: which under normal execution should be impossible.
        console.error(
          '[ERROR] Either connected peer or active peer cannot retrieve latest block.',
        );
        return;
      }

      let shouldBroadcastLatestBlock = false;

      // Check if the peer is one block ahead
      if (peerLatestBlock.previousHash === activePeerLatestBlock.hash) {
        if (isValidHash(peerLatestBlock.hash)) {
          // Append block to the blockchain.
          activeBlockChain[peerLatestBlock.index] = peerLatestBlock;

          // Broadcast latest block to connected peers.
          shouldBroadcastLatestBlock = true;
        }
      } else if (peerLatestBlock.index > activePeerLatestBlock.index) {
        // Ask peer for entire blockchain
        // connectedPeer.blockChain

        const isPeerBlockChainValid = Object.values(
          connectedPeer.blockChain,
        ).reduce((previousBlocksValid, block) => {
          const { index, data, timeStamp, previousHash, nonce, hash } = block;
          const reComputedHash = computeHash(
            index,
            data,
            timeStamp,
            previousHash,
            nonce,
          );

          return previousBlocksValid && reComputedHash === hash;
        }, true);

        if (
          isPeerBlockChainValid &&
          Object.keys(connectedPeer.blockChain).length >
            Object.keys(activeBlockChain).length
        ) {
          // Replace active peer's chain with that of the connected peer.
          // state.entities[state.activePeer]!.blockChain
          activeBlockChain = lodash.cloneDeep(connectedPeer.blockChain);

          // Broadcast latest block to connected peers.
          shouldBroadcastLatestBlock = true;
        }
      }

      // The longest blockchain is considered the most up-to-date.

      if (shouldBroadcastLatestBlock) {
        // Perform the same for all connected peers. This time, the currently active peer will be the peer to connect with, and the connected peer will be assumed to be the
        // active peer, as they have the outdated blockchain.
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPeerData.pending, (state, action) => {
        console.log('[INFO] Fetching peer data');
      })
      .addCase(fetchPeerData.rejected, (state, action) => {
        console.error('[ERROR] Error fetching peer data', action.payload);

        state.setUpState = OperationStates.failed;
      })
      .addCase(fetchPeerData.fulfilled, (state, { payload }) => {
        // Set-up the peer's info and their version of the blockChain.

        let settingUpFirstPeer = false;
        // After the first peer is created, it is guaranteed that there will always be atleast one peer in the state.
        if (state.ids.length === 0) settingUpFirstPeer = true;

        const activeBlockChain = state.entities[state.activePeer]?.blockChain;

        // Make sure the active peer's blockchain exists, as the app will not be able to function if otherwise.
        if (!settingUpFirstPeer && !activeBlockChain) {
          console.error(
            `[ERROR] The active peer's blockchain does not exist. Unable to initialize new peer's blockchain with the already mined genesis block.`,
          );
          return;
        }

        // Create the peer.
        state.ids.push(payload.id);
        state.entities[payload.id] = {
          id: payload.id,
          name: payload.name,
          blockChain: {},
        };

        if (!settingUpFirstPeer) {
          // Mining of the genesis block is done right after the the first peer is created.
          // The already mined genesis block must be copied to this peer's blockchain.
          state.entities[payload.id]!.blockChain[0] = activeBlockChain![0];
        }

        // Set the active peer.
        // blockChainSlice.caseReducers.setActivePeer(state, {
        //   payload: payload.id,
        // });

        if (settingUpFirstPeer) {
          // Acknowledge the app that the blockchain has been setup.
          state.setUpState = OperationStates.complete;
          state.activePeer = payload.id;
        }

        console.log('[INFO] The current peer has been set');
      });
  },
});

// Selectors
const selectBlockChainSlice = (state: RootState) => state.blockChain;

export const selectActivePeer = createSelector(
  [selectBlockChainSlice],
  blockChain => blockChain.activePeer,
);

export const selectActivePeerBlockChain = createSelector(
  [selectBlockChainSlice, selectActivePeer],
  (peers, activePeer) => peers.entities[activePeer]?.blockChain ?? {},
);

export const selectBlockIndexes = createSelector(
  [selectActivePeerBlockChain],
  blockChain => Object.keys(blockChain),
);

export const selectAllBlocksForCurrentPeer = createSelector(
  [selectActivePeerBlockChain],
  blockChain => Object.values(blockChain),
);

export const selectActivePeerBlockByIndex = (index: number) =>
  createSelector([selectActivePeerBlockChain], blockChain => blockChain[index]);

export const selectBlockChainSetUpState = createSelector(
  [selectBlockChainSlice],
  blockChain => blockChain.setUpState,
);

export const selectPeerIds = createSelector(
  [selectBlockChainSlice],
  peers => peers.ids,
);

export const selectPeersLookup = createSelector(
  [selectBlockChainSlice],
  peers => peers.entities,
);

export const selectAllPeers = createSelector(
  [selectPeerIds, selectPeersLookup],
  (peerIds, peersLookup) =>
    peerIds
      .map(id => peersLookup[id])
      .filter(peer => peer !== undefined) as Peer[],
);

export const selectPeerById = (peerId: string) =>
  createSelector(
    [selectBlockChainSlice],
    blockChain => blockChain.entities[peerId],
  );

export const selectPeerCount = createSelector(
  [selectPeerIds],
  peerIds => peerIds.length,
);

// Actions
export const {
  mineBlock,
  reMineBlock,
  updateLatestBlockHashes,
  removePeer,
  setActivePeer,
  connectWithPeer,
} = blockChainSlice.actions;

// Reducer
export default blockChainSlice.reducer;
