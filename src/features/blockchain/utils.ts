import crypto from 'crypto';
import lodash from 'lodash';
import { WritableDraft } from 'immer/dist/internal';
import { EntityAdapter, nanoid } from '@reduxjs/toolkit';

import type { Block, Peer, UnhashedBlock } from './interfaces/blockchain.types';
import { BlockchainSliceState } from './blockchain.slice';

/**
 * A valid hash is one that starts with 3 zeros
 */
export const isValidHash = (hash: string) => {
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
export const computeHash = (
  index: number,
  data: string,
  timeStamp: number,
  prevHash: string,
  nonce: number,
): string => {
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

export const updateChainOfPeerWithAnother = (
  sourceChain: WritableDraft<Block[]>,
  chainToUpdate: WritableDraft<Block[]>,
  state: WritableDraft<BlockchainSliceState>,
  sourcePeerId: string,
  chainToUpdatePeerId: string,
  blocksCollectionAdapter: EntityAdapter<Block>,
): boolean | undefined => {
  const peerLatestBlock = sourceChain.at(-1);
  const activePeerLatestBlock = chainToUpdate.at(-1);

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
      // chainToUpdate[peerLatestBlock.index] = peerLatestBlock;

      // TODO - Add a copy of peerLatestBlock to the blocksCollection and use the copy's id here.
      // state.peerBlockChainMap[chainToUpdatePeerId].push(peerLatestBlock.id);
      const clonedBlock = lodash.cloneDeep(peerLatestBlock);
      clonedBlock.id = nanoid();
      state.peerBlockChainMap[chainToUpdatePeerId].push(clonedBlock.id);
      blocksCollectionAdapter.addOne(state.blockchain, clonedBlock);

      // Broadcast latest block to connected peers.
      shouldBroadcastLatestBlock = true;
    }
  } else if (peerLatestBlock.index > activePeerLatestBlock.index) {
    // Ask peer for entire blockchain
    // sourceChain.blockchain

    const isPeerBlockChainValid = sourceChain.reduce(
      (previousBlocksValid, block) => {
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

    if (isPeerBlockChainValid && sourceChain.length > chainToUpdate.length) {
      // Replace active peer's chain with that of the connected peer.
      // state.entities[state.activePeer]!.blockchain
      // chainToUpdate = lodash.cloneDeep(sourceChain);
      console.log(
        `Replacing blockchain of ${chainToUpdatePeerId} with ${sourcePeerId}`,
      );

      // TODO - Take a copy of the source chain and add it all to the blocks collection. Referecne the ids
      // of the copies here.
      state.peerBlockChainMap[chainToUpdatePeerId] =
        state.peerBlockChainMap[sourcePeerId];
      const clonedBlockchain = state.peerBlockChainMap[sourcePeerId].map(
        blockId => {
          const clonedBlock = lodash.cloneDeep(
            state.blockchain.entities[blockId]!,
          );
          clonedBlock.id = nanoid();
          return clonedBlock;
        },
      );
      blocksCollectionAdapter.addMany(state.blockchain, clonedBlockchain);

      // Broadcast latest block to connected peers.
      shouldBroadcastLatestBlock = true;
    }
  }

  return shouldBroadcastLatestBlock;
};

export const getBlockchainForPeer = (
  state: WritableDraft<BlockchainSliceState>,
  peerId: Peer['id'],
) => {
  const blockIds = state.peerBlockChainMap[peerId];

  if (!blockIds) {
    return null;
  }

  return blockIds.map(
    blockId => state.blockchain.entities[blockId] as WritableDraft<Block>,
  );
};

export const getPeerLatestBlock = (
  state: WritableDraft<BlockchainSliceState>,
  peerId: Peer['id'],
): WritableDraft<Block> | null => {
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
