import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
  createSelector,
} from '@reduxjs/toolkit';

import {
  computeHash,
  generateBlock,
  getBlockchainForPeer,
  getPeerLatestBlock,
  updateChainOfPeerWithAnother,
  appendBlockCloneToChain,
  getAllConnectedPeerIds,
} from './utils';
import { OperationStates } from '../../app/constants';

import type { RootState } from '../../index';
import {
  Block,
  Peer,
  PeerToBlockchainMap,
  UnhashedBlock,
} from './blockchain.types';

type PeerFromAPI = Omit<Peer, 'blockchain'>;

const peersAdapter = createEntityAdapter<Peer>();

/**
 * Stores all the blocks of all the peers.
 * The appropriate blocks are mapped to the peers using `peerBlockChainMap`
 */
const blocksCollectionAdapter = createEntityAdapter<Block>();

const initialState = {
  peers: peersAdapter.getInitialState({
    activePeer: '' as string,
  }),
  blockchain: blocksCollectionAdapter.getInitialState(),

  /**
   * Maps peer ids to an array holding the ids of their blocks (i.e., their copy of the blockchain). The
   * individual blocks can then be looked up from the `state.blockchain.entities` object.
   */
  peerBlockChainMap: {} as PeerToBlockchainMap,
  /**
   * Keeps track of the set-up state. Used only when the application bootstraps.
   */
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

      const connectedPeers = getAllConnectedPeerIds(
        state,
        state.peers.activePeer,
      );

      console.log('CONNECTED PEERS:', connectedPeers);
      connectedPeers.forEach(peerId => {
        updateChainOfPeerWithAnother(
          getBlockchainForPeer(state, sourcePeer.id)!,
          getBlockchainForPeer(state, peerId)!,
          state,
          sourcePeer.id,
          peerId,
          blocksCollectionAdapter,
        );
      });
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
      const connectedPeer = state.peers.entities[peerId];
      const activePeer = state.peers.entities[state.peers.activePeer];

      const activeBlockchain = getBlockchainForPeer(
        state,
        state.peers.activePeer,
      );
      const peerBlockchain = getBlockchainForPeer(state, peerId);

      if (!activePeer) {
        console.error(`The active peer does not exist.`);
        return;
      }
      if (!connectedPeer) {
        console.error(`There was an issue connecting with peer #${peerId}.`);
        return;
      }
      if (!activeBlockchain) {
        console.error(`Error retrieving the active peer's blockchain.`);
        return;
      }
      if (!peerBlockchain) {
        console.error(
          `Error retrieving the peer #${connectedPeer.id}'s blockchain.`,
        );
        return;
      }

      // The longer chain is considered to be the valid one
      const longerChain =
        activeBlockchain.length > peerBlockchain.length
          ? activeBlockchain
          : peerBlockchain;

      const peerWithLongerChain =
        activeBlockchain.length > peerBlockchain.length
          ? activePeer.id
          : peerId;

      // Propgate the updates to all transitively connected peers as well
      getAllConnectedPeerIds(state, peerWithLongerChain).forEach(peerId => {
        updateChainOfPeerWithAnother(
          longerChain!,
          getBlockchainForPeer(state, peerId)!,
          state,
          peerWithLongerChain,
          peerId,
          blocksCollectionAdapter,
        );
      });
    },
    connectWithPeer(state, { payload: peerId }: { payload: Peer['id'] }) {
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
    disconnectPeer(state, { payload: peerId }: { payload: Peer['id'] }) {
      const activePeer = state.peers.entities[state.peers.activePeer];
      const connectedPeer = state.peers.entities[peerId];

      if (activePeer && connectedPeer) {
        activePeer.connectedPeers.splice(
          activePeer.connectedPeers.indexOf(peerId),
          1,
        );
        connectedPeer.connectedPeers.splice(
          connectedPeer.connectedPeers.indexOf(activePeer.id),
          1,
        );
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPeerData.pending, (state, action) => {
        console.log('Fetching peer data');
      })
      .addCase(fetchPeerData.rejected, (state, action) => {
        console.error('Error fetching peer data', action.payload);

        if (state.peers.ids.length === 0)
          state.setUpState = OperationStates.failed;
      })
      .addCase(fetchPeerData.fulfilled, (state, { payload }) => {
        // Set-up the peer's info and their version of the blockchain.

        let settingUpFirstPeer = false;

        // After the first peer is created, it is guaranteed that there will always be atleast one peer in the state.
        if (state.peers.ids.length === 0) settingUpFirstPeer = true;

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

          appendBlockCloneToChain(
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

        console.log('The current peer has been set successfully.');
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
    return peerToBlockchainMap[activePeer.id]
      .map(blockId => blocksSlice.entities[blockId]!)
      .filter(block => block !== undefined);
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
  disconnectPeer,
} = blockchainSlice.actions;

// Reducer
export default blockchainSlice.reducer;
