import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
  createSelector,
} from '@reduxjs/toolkit';

import {
  updateBlockchainsOfAllConnectedPeers,
  computeHash,
  generateBlock,
  getBlockchainForPeer,
  getPeerLatestBlock,
  updateChainOfPeerWithAnother,
  appendBlockToChain,
} from './utils';
import { OperationStates } from '../../app/constants';

import type { RootState } from '../../index';
import {
  Block,
  Peer,
  PeerToBlockchainMap,
  UnhashedBlock,
} from './interfaces/blockchain.types';

type PeerFromAPI = Omit<Peer, 'blockchain'>;

export type ExtendedBlockChainSliceState = {
  activePeer: string;
};

const peersAdapter = createEntityAdapter<Peer>();

/**
 * Stores all the blocks of all the peers.
 * The appropriate blocks are mapped to the peers using `peerBlockChainMap`
 */
const blocksCollectionAdapter = createEntityAdapter<Block>();

/**
 * Maps peer ids to an array of their blocks (i.e., their copy of the blockchain)
 */
const _peerBlockChainMap: PeerToBlockchainMap = {};

const initialState = {
  peers: peersAdapter.getInitialState({
    activePeer: '' as string,
  } as ExtendedBlockChainSliceState),
  blockchain: blocksCollectionAdapter.getInitialState(),
  peerBlockChainMap: _peerBlockChainMap,
  setUpState: OperationStates.pending as keyof typeof OperationStates,
};

export type BlockchainSliceState = typeof initialState;

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

const blockchainSlice = createSlice({
  name: 'blockchain',
  initialState,
  reducers: {
    mineBlock(state, { payload: data }: { payload: string }) {
      const activeBlockchain = getBlockchainForPeer(
        state,
        state.peers.activePeer,
      );
      if (!activeBlockchain) {
        console.error(
          `The active peer does not exist. Therefore, the active blockchain cannot be retrieved and the new block could not be mined.`,
        );

        return;
      }

      const previousBlock = getPeerLatestBlock(state, state.peers.activePeer);

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
          index: activeBlockchain.length,
          data,
          previousHash: previousBlock.hash,
        });
      }

      blocksCollectionAdapter.addOne(state.blockchain, block);
      state.peerBlockChainMap[state.peers.activePeer] = [
        ...state.peerBlockChainMap[state.peers.activePeer],
        block.id,
      ];

      console.log(`Added block #${block.index}`);

      // Broadcast new block to all connected peers
      let sourcePeer = state.peers.entities[state.peers.activePeer]!;

      updateBlockchainsOfAllConnectedPeers(
        state,
        blocksCollectionAdapter,
        sourcePeer,
      );
    },
    reMineBlock(
      state,
      {
        payload: { data, previousHash, index, id },
      }: { payload: UnhashedBlock & { id: string } },
    ) {
      const activeBlockchain = getBlockchainForPeer(
        state,
        state.peers.activePeer,
      );
      if (!activeBlockchain) {
        console.error(
          `The active peer does not exist. Therefore, the active blockchain cannot be retrieved and the invalidated block could not be re-mined.`,
        );

        return;
      }

      const block = generateBlock({ id, index, data, previousHash });

      if (index < activeBlockchain.length - 1) {
        activeBlockchain[index + 1].previousHash = block.hash;

        const { data, timeStamp, previousHash, nonce } =
          activeBlockchain[index + 1];
        activeBlockchain[index + 1].hash = computeHash(
          index + 1,
          data,
          timeStamp,
          previousHash,
          nonce,
        );
      }
      activeBlockchain[index] = block;
      blocksCollectionAdapter.setOne(state.blockchain, block);

      console.log(`Updated block #${block.index}`);
    },
    updateLatestBlockHashes(
      state,
      {
        payload: { invalidIndex, newData },
      }: { payload: { invalidIndex: number; newData: string } },
    ) {
      const activeBlockchain = getBlockchainForPeer(
        state,
        state.peers.activePeer,
      );
      if (!activeBlockchain) {
        console.error(
          `The active peer does not exist. Therefore, the active blockchain cannot be retrieved and the block hashes could not be updated.`,
        );

        return;
      }

      const invalidatorBlock = activeBlockchain[invalidIndex];

      const invalidBlocks = activeBlockchain.filter(
        block => block.index >= invalidIndex,
      );

      invalidatorBlock.data = newData;
      const updatedBlocks = invalidBlocks.map((block, i) => {
        if (i > 0) block.previousHash = invalidBlocks.at(i - 1)!.hash;
        const { index, data, timeStamp, previousHash, nonce } = block;
        block.hash = computeHash(index, data, timeStamp, previousHash, nonce);

        return block;
      });

      updatedBlocks.forEach(block => (activeBlockchain[block.index] = block));
    },
    removePeer(state, { payload }: { payload: { peerId: string } }) {
      const idIdx = state.peers.ids.indexOf(payload.peerId);

      // Delete the peer
      peersAdapter.removeOne(state.peers, payload.peerId);

      // Delete all associated blocks
      blocksCollectionAdapter.removeMany(
        state.blockchain,
        state.peerBlockChainMap[payload.peerId],
      );

      // Delete peer-to-blockchain mapping
      delete state.peerBlockChainMap[payload.peerId];

      // Set the active peer
      state.peers.activePeer = state.peers.ids.at(idIdx - 1) as string;
    },
    setActivePeer(state, { payload: peerId }: { payload: string }) {
      console.log('active peer to set:', peerId);
      state.peers.activePeer = peerId;
    },
    updateBlockChainWithConnectedPeer(
      state,
      { payload: peerId }: { payload: string },
    ) {
      // Get active peer blockchain
      let activeBlockchain = getBlockchainForPeer(
        state,
        state.peers.activePeer,
      );

      if (!activeBlockchain) {
        console.error(
          `The active peer does not exist. Aborting connection with peer.`,
        );

        return;
      }

      // Connect with the peer
      const connectedPeer = state.peers.entities[peerId];

      if (!connectedPeer) {
        // Handle connection failure
        console.error(`There was an issue connecting with peer #${peerId}`);

        return;
      }

      /* The longest blockchain is considered to be the most up-to-date. */

      updateChainOfPeerWithAnother(
        getBlockchainForPeer(state, connectedPeer.id)!,
        activeBlockchain,
        state,
        connectedPeer.id,
        state.peers.activePeer,
        blocksCollectionAdapter,
      );

      // Call again, this time reversing the source and peer to update so that it will update the shorter
      // chain regardless of which of the two peers initiated the connection.
      updateChainOfPeerWithAnother(
        activeBlockchain,
        getBlockchainForPeer(state, connectedPeer.id)!,
        state,
        state.peers.activePeer,
        connectedPeer.id,
        blocksCollectionAdapter,
      );
    },
    connectWithPeer(state, { payload: peerId }: { payload: string }) {
      if (!state.peers.activePeer || !state.peers.entities[peerId]) {
        console.error(
          'Invalid information passed to connectWithPeer. Peer with provided id does not exist, or the application is in an unreliable state as the activePeer does not exist.',
        );
      }
      if (peerId === state.peers.activePeer) {
        console.warn(`The peer to connect with cannot be the active peer.`);
        return;
      }

      // Update the connectedPeers array of both peers
      state.peers.entities[state.peers.activePeer]?.connectedPeers.push(peerId);
      state.peers.entities[peerId]?.connectedPeers.push(state.peers.activePeer);

      blockchainSlice.caseReducers.updateBlockChainWithConnectedPeer(state, {
        payload: peerId,
      });
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPeerData.pending, (state, action) => {
        console.log('Fetching peer data');
      })
      .addCase(fetchPeerData.rejected, (state, action) => {
        console.error('Error fetching peer data', action.payload);

        state.setUpState = OperationStates.failed;
      })
      .addCase(fetchPeerData.fulfilled, (state, { payload }) => {
        // Set-up the peer's info and their version of the blockchain.

        let settingUpFirstPeer = false;

        // After the first peer is created, it is guaranteed that there will always be atleast one peer in the state.
        if (state.peers.ids.length === 0) {
          settingUpFirstPeer = true;
        }

        const activeBlockchain =
          getBlockchainForPeer(state, state.peers.activePeer) ?? [];

        // Make sure the active peer's blockchain exists, as the app will not be able to function if otherwise.
        if (!settingUpFirstPeer && !activeBlockchain) {
          console.error(
            `The active peer's blockchain does not exist. Unable to initialize new peer's blockchain with the already mined genesis block.`,
          );
          return;
        }

        // Create the peer.
        peersAdapter.addOne(state.peers, {
          id: payload.id,
          name: payload.name,
          connectedPeers: [],
        });
        state.peerBlockChainMap[payload.id] = [];

        if (!settingUpFirstPeer) {
          // Mining of the genesis block is done right after the the first peer is created.
          // The already mined genesis block must be copied to this peer's blockchain.
          // state.peerBlockChainMap[payload.id][0] =
          //   state.peerBlockChainMap[state.peers.activePeer][0];

          appendBlockToChain(
            state,
            blocksCollectionAdapter,
            state.blockchain.entities[
              state.peerBlockChainMap[state.peers.activePeer][0]
            ]!,
            payload.id,
          );
        }

        if (settingUpFirstPeer) {
          // Acknowledge the app that the blockchain has been setup.
          state.setUpState = OperationStates.complete;
          state.peers.activePeer = payload.id;
        }

        console.log('The current peer has been set');
      });
  },
});

// Selectors
const selectBlockChainStateSlice = (state: RootState) => state.blockchain;

const selectBlocksCollectionSlice = createSelector(
  [selectBlockChainStateSlice],
  stateSlice => stateSlice.blockchain,
);

const selectPeersSlice = createSelector(
  [selectBlockChainStateSlice],
  stateSlice => stateSlice.peers,
);

const selectPeerToBlockchainMap = createSelector(
  [selectBlockChainStateSlice],
  stateSlice => stateSlice.peerBlockChainMap,
);

export const selectActivePeerId = createSelector(
  [selectPeersSlice],
  peersSlice => peersSlice.activePeer,
);

export const selectActivePeer = createSelector(
  [selectPeersSlice, selectActivePeerId],
  (peersSlice, activePeerId) => peersSlice.entities[activePeerId],
);

export const selectActivePeerBlockChain = createSelector(
  [selectBlocksCollectionSlice, selectPeerToBlockchainMap, selectActivePeer],
  (blocksSlice, peerToBlockchainMap, activePeer) => {
    if (!activePeer) return null;

    console.log(peerToBlockchainMap, activePeer, blocksSlice);
    return peerToBlockchainMap[activePeer.id].map(
      blockId => blocksSlice.entities[blockId]!,
    );
    // .filter(block => block !== undefined);
  },
);

export const selectActiveBlockchainIds = createSelector(
  [selectPeerToBlockchainMap, selectActivePeer],
  (peerToBlockchainMap, activePeer) => {
    if (!activePeer) return null;

    return peerToBlockchainMap[activePeer.id];
  },
);

export const selectActivePeerBlockByIndex = (index: number) =>
  createSelector([selectActivePeerBlockChain], blockchain => {
    if (!blockchain) return;

    return blockchain[index];
  });

export const selectBlockChainSetUpState = createSelector(
  [selectBlockChainStateSlice],
  stateSlice => stateSlice.setUpState,
);

export const selectPeerIds = createSelector(
  [selectPeersSlice],
  peers => peers.ids,
);

export const selectPeersLookup = createSelector(
  [selectPeersSlice],
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
  createSelector([selectPeersSlice], peersSlice => peersSlice.entities[peerId]);

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
} = blockchainSlice.actions;

// Reducer
export default blockchainSlice.reducer;
