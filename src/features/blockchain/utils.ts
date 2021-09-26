import crypto from 'crypto';
import lodash from 'lodash';
import { WritableDraft } from 'immer/dist/internal';
import { nanoid } from '@reduxjs/toolkit';

import type { EntityAdapter, EntityState } from '@reduxjs/toolkit';

import type { Block, Peer, UnhashedBlock } from './blockchain.types';
import type { BlockchainSliceState } from './blockchain.slice';

/**
 * A valid hash is one that starts with 3 zeros
 */
export function isValidHash(hash: string): boolean {
  return hash.startsWith('000') || hash === '0';
}

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
export function computeHash(
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
}

/**
 * Finds the valid hash for this blockchain and constructs the block ready to be mined.
 *
 * @param index The block index.
 * @param data The data to be part of the block.
 * @param previousHash The hash of the previous mined block.
 * @returns The block ready to be mined.
 */
export function generateBlock({
  id,
  index,
  data,
  previousHash,
}: UnhashedBlock): Block {
  let hash = '';
  let nonce = 0;
  let timeStamp: number = Date.now();

  while (!isValidHash(hash)) {
    timeStamp = Date.now();
    hash = computeHash(index, data, timeStamp, previousHash, nonce);
    nonce++;
  }
  nonce--; // As the nonce is incremented even after a valid hash is found.

  console.log('Valid hash', hash, nonce);

  return {
    id: id ?? nanoid(),
    index,
    data,
    timeStamp,
    hash,
    previousHash,
    nonce,
  };
}

/**
 * Re-computes the hash for every block to see if it matches the hash stored in the block.
 *
 * @param blockchain The blockchain whose validity must be checked.
 * @returns `true` if the hash of every block is valid, false otherwise.
 */
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

/**
 * Creates a deep copy of the provided `block`, re-assigns it a new id, and then stores this block in the state and links it to the peer with
 * the given id. A deep copy is taken so that updating the block's contents in the future will not have any effect on the copy of the chain
 * held by the other peer.
 *
 * @param state The redux slice state.
 * @param blocksCollectionAdapter The `EntityAdapter` used to store the blocks that are part of the blockchains of the peers.
 * @param block The block to append to the chain of the peer with id `peerId`.
 * @param peerId The id of the peer with the blockchain to which the block must be appended.
 * @returns The state managed by the `EntityAdapter` `blocksCollectionAdapter` with the necessary updates made.
 */
export function appendBlockCloneToChain(
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
}

/**
 * Merges the chain of `sourcePeerId` into the chain of `chainToUpdatePeerId`. For each block to be merged into the destination
 * chain, a deep copy of it is made and a new id is assigned to this copy. This copy is then merged into the destination chain.
 * So, updating one of the chains' blocks later on will not modify the other chain.
 *
 * @param state The redux slice state.
 * @param blocksCollectionAdapter The `EntityAdapter` used to store the blocks that are part of the blockchains of the peers.
 * @param chainToUpdatePeerId The id of the peer whose copy of the blockchain must be updated.
 * @param sourcePeerId The id of the peer whose copy of the blockchain must be merged into the chain of the peer with id `chainToUpdatePeerId`.
 * @returns The state managed by the `EntityAdapter` `blocksCollectionAdapter` with the necessary updates made.
 */
export function mergeBlockchain(
  state: WritableDraft<BlockchainSliceState>,
  blocksCollectionAdapter: EntityAdapter<Block>,
  chainToUpdatePeerId: Peer['id'],
  sourcePeerId: Peer['id'],
): WritableDraft<EntityState<Block>> {
  // Take a copy of the source chain and add it all to the blocks collection. Reference the ids
  // of the copies here.

  const chainToMerge = state.peerBlockChainMap[sourcePeerId]
    .filter((_, i) => i >= state.peerBlockChainMap[chainToUpdatePeerId].length)
    .map(blockId => {
      const clonedBlock = lodash.cloneDeep(state.blockchain.entities[blockId]!);
      clonedBlock.id = nanoid();

      return clonedBlock;
    });

  const chainToUpdate = state.peerBlockChainMap[chainToUpdatePeerId].map(
    (blockId, i) => {
      if (i === 0) return state.blockchain.entities[blockId]!;

      const clonedBlock = lodash.cloneDeep(state.blockchain.entities[blockId]!);
      clonedBlock.id = nanoid();

      if (i === state.peerBlockChainMap[chainToUpdatePeerId].length - 1) {
        // If this is the last block of the chain to be updated, its hash must be updated to the
        // equivalent one from the source chain, even though this should technically invalidate
        // the chain.
        clonedBlock.hash =
          state.blockchain.entities[
            state.peerBlockChainMap[sourcePeerId][i]
          ]!.hash;

        // Remove the block with the invalid hash as a new one has been created, and this block would
        // otherwise be orphaned.
        blocksCollectionAdapter.removeOne(state.blockchain, blockId);
      }

      return clonedBlock!;
    },
  );

  const clonedBlockchain = chainToUpdate.concat(chainToMerge);

  // Update the peer-to-blockchain map
  state.peerBlockChainMap[chainToUpdatePeerId] = clonedBlockchain.map(
    block => block.id,
  );

  // Store the new blockchain copy in the state, and return a reference to the blocks state slice.
  return blocksCollectionAdapter.addMany(state.blockchain, clonedBlockchain);
}

/**
 * Determines which method to call `mergeBlockchain` or `appendBlockCloneToChain` and does what's required to correctly update
 * the copy of the blockchain held by the peer with id `chainToUpdatePeerId`.
 *
 * @param sourceChain The copy of the blockchain used to update the destination chain.
 * @param chainToUpdate The copy of the blockchain that must be updated.
 * @param state The redux slice state.
 * @param sourcePeerId The id of the peer whose copy of the blockchain must be merged / latest block appended into the chain of the peer with id `chainToUpdatePeerId`.
 * @param chainToUpdatePeerId The id of the peer whose copy of the blockchain must be updated.
 * @param blocksCollectionAdapter The `EntityAdapter` used to store the blocks that are part of the blockchains of the peers.
 */
export function updateChainOfPeerWithAnother(
  sourceChain: WritableDraft<Block[]>,
  chainToUpdate: WritableDraft<Block[]>,
  state: WritableDraft<BlockchainSliceState>,
  sourcePeerId: string,
  chainToUpdatePeerId: string,
  blocksCollectionAdapter: EntityAdapter<Block>,
): void {
  const peerLatestBlock = sourceChain.at(-1);
  const activePeerLatestBlock = chainToUpdate.at(-1);
  console.log('in here');

  if (!peerLatestBlock || !activePeerLatestBlock) {
    // Both blockchains are empty: which under normal execution should be impossible.
    console.error(
      'Either connected peer or active peer cannot retrieve latest block.',
    );
    return;
  }

  // Check if the peer is one block ahead
  if (peerLatestBlock.previousHash === activePeerLatestBlock.hash) {
    console.log('appeniding block');
    if (isValidHash(peerLatestBlock.hash)) {
      appendBlockCloneToChain(
        state,
        blocksCollectionAdapter,
        peerLatestBlock,
        chainToUpdatePeerId,
      );
    }
  } else if (peerLatestBlock.index > activePeerLatestBlock.index) {
    // Perform a validation check here to see if source chain can in fact be merged into the dest. Done by
    // getting the block with the lowest index (i.e. the first block) to be merged and checking whether its
    // previousHash is equal to the latest block hash in the dest chain. If they are not equal, it is implied that
    // the dest chain is invalid because the longest chain is considered to be the most up-do-date, and therefore valid.
    if (
      chainToUpdate.at(-1)?.hash !==
      sourceChain[chainToUpdate.length].previousHash
    ) {
      console.error(
        `${state.peers.entities[sourcePeerId]?.name}'s chain is invalid.'`,
      );
      return;
    }

    // const isPeerBlockChainValid = isBlockchainValid(sourceChain);
    // console.log('checking to replace chain', isPeerBlockChainValid);

    // if (isPeerBlockChainValid && sourceChain.length > chainToUpdate.length) {
    if (sourceChain.length > chainToUpdate.length) {
      // Replace active peer's chain with that of the connected peer.
      console.log(
        `Replacing blockchain of ${chainToUpdatePeerId} with ${sourcePeerId}`,
      );

      mergeBlockchain(
        state,
        blocksCollectionAdapter,
        chainToUpdatePeerId,
        sourcePeerId,
      );
    }
  }
}

/**
 * @param state The redux slice state.
 * @param peerId The id of the peer whose copy of the blockchain must be obtained.
 * @returns An array of the blocks representing the peer's copy of the blockchain.
 */
export function getBlockchainForPeer(
  state: WritableDraft<BlockchainSliceState>,
  peerId: Peer['id'],
): WritableDraft<Block>[] | null {
  const blockIds = state.peerBlockChainMap[peerId];

  if (!blockIds) {
    return null;
  }

  return blockIds.map(blockId => state.blockchain.entities[blockId]!);
}

/**
 * @param state The redux slice state.
 * @param peerId The id of the peer whose latest block must be obtained.
 * @returns The most recently mined block in the copy of the chain held by the peer with the given id.
 */
export function getPeerLatestBlock(
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
}

/**
 * Gets a list of the ids of all peers that are connected to the given peer directly or indirectly.
 *
 * @param state The redux slice state.
 * @param peerId The id of the peer for whom to retrieve all the connected peer ids.
 * @returns An array of the ids of all peers that are connected to the given peer directly or indirectly.
 */
export function getAllConnectedPeerIds(
  state: WritableDraft<BlockchainSliceState>,
  peerId: Peer['id'],
): Peer['id'][] {
  let currentPeer = state.peers.entities[peerId]!;

  const connectedPeers: Peer['id'][] = collectAllConnectedPeerIds(
    state,
    currentPeer.id,
  );
  return Array.from(new Set(connectedPeers)).filter(
    connPeerId => connPeerId !== peerId,
  );
}

/**
 * Recursively accumulates a list of the ids of all peers that are connected to the given peer directly or indirectly.
 * Used internally by `getAllConnectedPeerIds`.
 *
 * @param state The redux slice state.
 * @param peerId The id of the peer for whom to collect all the connected peer ids.
 * @param connectedPeers An array of the connected peer ids accumulated so far. Used internally by the function during recursion. Defaults to an empty array.
 * @returns An array of the ids of all peers that are connected to the given peer directly or indirectly, that also includes `peerId`.
 */
function collectAllConnectedPeerIds(
  state: WritableDraft<BlockchainSliceState>,
  peerId: Peer['id'],
  connectedPeers: Peer['id'][] = [],
): Peer['id'][] {
  let currentPeer = state.peers.entities[peerId]!;
  if (
    currentPeer.connectedPeers.length === 0 ||
    currentPeer.connectedPeers.reduce(
      (alreadyChecked: boolean, connPeerId: Peer['id']) =>
        alreadyChecked && connectedPeers.includes(connPeerId),
      true,
    )
  ) {
    return connectedPeers;
  }

  connectedPeers.push(...currentPeer.connectedPeers);

  for (let i = 0; i < currentPeer.connectedPeers.length; i++) {
    collectAllConnectedPeerIds(
      state,
      currentPeer.connectedPeers[i],
      connectedPeers,
    );
  }

  return connectedPeers;
}
