import crypto from 'crypto';
import lodash from 'lodash';
import { WritableDraft } from 'immer/dist/internal';

import type { Block, BlockChain, UnhashedBlock } from './interfaces/BlockChain';

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

  return { index, data, timeStamp, hash, previousHash, nonce };
};

export const updateChainOfPeerWithAnother = (
  sourceChain: WritableDraft<BlockChain>,
  chainToUpdate: WritableDraft<BlockChain>,
): boolean | undefined => {
  const peerLatestBlock = Object.values(sourceChain).at(-1);
  const activePeerLatestBlock = Object.values(chainToUpdate).at(-1);

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
      chainToUpdate[peerLatestBlock.index] = peerLatestBlock;

      // Broadcast latest block to connected peers.
      shouldBroadcastLatestBlock = true;
    }
  } else if (peerLatestBlock.index > activePeerLatestBlock.index) {
    // Ask peer for entire blockchain
    // sourceChain.blockChain

    const isPeerBlockChainValid = Object.values(sourceChain).reduce(
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

    if (
      isPeerBlockChainValid &&
      Object.keys(sourceChain).length > Object.keys(chainToUpdate).length
    ) {
      // Replace active peer's chain with that of the connected peer.
      // state.entities[state.activePeer]!.blockChain
      chainToUpdate = lodash.cloneDeep(sourceChain);

      // Broadcast latest block to connected peers.
      shouldBroadcastLatestBlock = true;
    }
  }

  return shouldBroadcastLatestBlock;
};
