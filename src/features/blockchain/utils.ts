import crypto from 'crypto';
import lodash from 'lodash';
import { WritableDraft } from 'immer/dist/internal';
import { EntityAdapter, EntityState, nanoid } from '@reduxjs/toolkit';

import type { Block, Peer, UnhashedBlock } from './interfaces/blockchain.types';
import { BlockchainSliceState } from './blockchain.slice';

/**
 * A valid hash is one that starts with 3 zeros
 */
export const isValidHash = function (hash: string): boolean {
  return hash.startsWith('000') || hash === '0';
};

/**
 * Computes a cryptographic hash of information in a block using the SHA-256 algorithm.
 *
 * @param index The block index.
 * @param data The data to mined as part of the block.
 * @param timeStamp The time the block was mined or the time the hash is being calculated at.
 * @param prevHash The hash of the previous block in the chain.
 * @param nonce The number of attempts to compute a valid hash. If `computeHash`
 * is being called when trying to find a valid hash, it represents the number of failed attempts
 * thus far.
 * @returns The SHA-256 hash of the provided data.
 */
export const computeHash = function (
  index: number,
  data: string,
  timeStamp: number,
  prevHash: string,
  nonce: number,
): string {
  const hash = crypto
    .createHash('sha256')
    .update('' + index + timeStamp + data + prevHash + nonce)
    .digest('hex');

  return hash;
};

/**
 * Finds the valid hash for this blockchain and constructs the block ready to be mined.
 *
 * @param index The block index.
 * @param data The data to be part of the block.
 * @param previousHash The hash of the previous mined block.
 * @returns The block ready to be mined.
 */
export const generateBlock = ({
  id,
  index,
  data,
  previousHash,
}: UnhashedBlock): Block => {
  let hash = '';
  let nonce = 0;
  let timeStamp: number = Date.now();

  while (!isValidHash(hash)) {
    timeStamp = Date.now();
    hash = computeHash(index, data, timeStamp, previousHash, nonce);
    nonce++;
  }
  nonce--; // As the nonce is incremented even after a valid hash is found.

  console.log('[INFO] Valid hash', hash, nonce);

  return {
    id: id ?? nanoid(),
    index,
    data,
    timeStamp,
    hash,
    previousHash,
    nonce,
  };
};

export const appendBlockToChain = function (
  state: WritableDraft<BlockchainSliceState>,
  blocksCollectionAdapter: EntityAdapter<Block>,
  block: WritableDraft<Block>,
  peerId: Peer['id'],
): WritableDraft<EntityState<Block>> {
  // Add a copy of peerLatestBlock to the blocksCollection and use the copy's id here.

  const clonedBlock = lodash.cloneDeep(block);
  clonedBlock.id = nanoid();
  state.peerBlockChainMap[peerId].push(clonedBlock.id);

  return blocksCollectionAdapter.addOne(state.blockchain, clonedBlock);
};

export const replaceBlockchain = function (
  state: WritableDraft<BlockchainSliceState>,
  blocksCollectionAdapter: EntityAdapter<Block>,
  chainToUpdatePeerId: Peer['id'],
  sourcePeerId: Peer['id'],
): WritableDraft<EntityState<Block>> {
  // Take a copy of the source chain and add it all to the blocks collection. Reference the ids
  // of the copies here.

  state.peerBlockChainMap[chainToUpdatePeerId] =
    state.peerBlockChainMap[sourcePeerId];
  const clonedBlockchain = state.peerBlockChainMap[sourcePeerId].map(
    blockId => {
      const clonedBlock = lodash.cloneDeep(state.blockchain.entities[blockId]!);
      clonedBlock.id = nanoid();
      return clonedBlock;
    },
  );

  return blocksCollectionAdapter.addMany(state.blockchain, clonedBlockchain);
};

export const isBlockchainValid = function (
  blockchain: WritableDraft<Block>[],
): boolean {
  return blockchain.reduce(
    (previousBlocksValid: boolean, block: WritableDraft<Block>) => {
      const { index, data, timeStamp, previousHash, nonce, hash } = block;
      const reComputedHash = computeHash(
        index,
        data,
        timeStamp,
        previousHash,
        nonce,
      );

      return previousBlocksValid && reComputedHash === hash;
    },
    true,
  );
};

export const addBlockToPeersChains = function (
  state: WritableDraft<BlockchainSliceState>,
  blocksCollectionAdapter: EntityAdapter<Block>,
  sourcePeer: WritableDraft<Peer>,
  alreadyUpdated: Peer['id'][] = [sourcePeer.id],
) {
  if (
    sourcePeer.connectedPeers
      .filter(peerId => peerId !== sourcePeer.id)
      .reduce(
        (prev: boolean, peerId) => prev && alreadyUpdated.includes(peerId),
        true,
      )
  ) {
    return;
  }

  for (const peerId of sourcePeer.connectedPeers) {
    if (alreadyUpdated.includes(peerId)) {
      console.log('alreadyUpdated includes peerId #', peerId);
      continue;
    }

    // Mine the block in their copy of the blockchain as well.
    if (!state.peers.entities[peerId]) {
      console.error(`Peer #${peerId} doesn't exist.`);
      return;
    }

    const peerLatestBlock = getPeerLatestBlock(state, peerId);

    if (!peerLatestBlock) return;

    updateChainOfPeerWithAnother(
      getBlockchainForPeer(state, sourcePeer.id)!,
      getBlockchainForPeer(state, peerId)!,
      state,
      sourcePeer.id,
      peerId,
      blocksCollectionAdapter,
    );

    addBlockToPeersChains(
      state,
      blocksCollectionAdapter,
      state.peers.entities[peerId]!,
      [...alreadyUpdated, peerId],
    );
  }
};

export const updateChainOfPeerWithAnother = function (
  sourceChain: WritableDraft<Block[]>,
  chainToUpdate: WritableDraft<Block[]>,
  state: WritableDraft<BlockchainSliceState>,
  sourcePeerId: string,
  chainToUpdatePeerId: string,
  blocksCollectionAdapter: EntityAdapter<Block>,
): boolean | undefined {
  const peerLatestBlock = sourceChain.at(-1);
  const activePeerLatestBlock = chainToUpdate.at(-1);

  if (!peerLatestBlock || !activePeerLatestBlock) {
    // Both blockchains are empty: which under normal execution should be impossible.
    console.error(
      'Either connected peer or active peer cannot retrieve latest block.',
    );
    return;
  }

  // Check if the peer is one block ahead
  if (peerLatestBlock.previousHash === activePeerLatestBlock.hash) {
    if (isValidHash(peerLatestBlock.hash)) {
      // Append block to the blockchain.

      appendBlockToChain(
        state,
        blocksCollectionAdapter,
        peerLatestBlock,
        chainToUpdatePeerId,
      );

      // Broadcast latest block to connected peers.
    }
  } else if (peerLatestBlock.index > activePeerLatestBlock.index) {
    const isPeerBlockChainValid = isBlockchainValid(sourceChain);

    if (isPeerBlockChainValid && sourceChain.length > chainToUpdate.length) {
      // Replace active peer's chain with that of the connected peer.
      console.log(
        `Replacing blockchain of ${chainToUpdatePeerId} with ${sourcePeerId}`,
      );

      replaceBlockchain(
        state,
        blocksCollectionAdapter,
        chainToUpdatePeerId,
        sourcePeerId,
      );

      // Broadcast latest block to connected peers.
    }
  }
};

export const getBlockchainForPeer = function (
  state: WritableDraft<BlockchainSliceState>,
  peerId: Peer['id'],
) {
  const blockIds = state.peerBlockChainMap[peerId];

  if (!blockIds) {
    return null;
  }

  return blockIds.map(
    blockId => state.blockchain.entities[blockId] as WritableDraft<Block>,
  );
};

export const getPeerLatestBlock = function (
  state: WritableDraft<BlockchainSliceState>,
  peerId: Peer['id'],
): WritableDraft<Block> | null {
  const peerLatestBlockIdx = state.peerBlockChainMap[peerId].at(-1);

  if (!peerLatestBlockIdx) {
    console.error(
      `Peer #${peerId} doesn't have a corresponding blockchain mapping.`,
    );
    return null;
  }
  if (!state.blockchain.entities[peerLatestBlockIdx]) {
    console.error(`Error retrieving latest block for peer #${peerId}`);
    return null;
  }

  const peerLatestBlock = state.blockchain.entities[peerLatestBlockIdx]!;
  return peerLatestBlock;
};
