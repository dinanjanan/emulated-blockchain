import crypto from 'crypto';

/**
 * A valid hash is one that starts with 3 zeros
 */
export const isValidHash = hash => {
	return hash.startsWith('000') || hash === '0';
};

/**
 * Computes a cryptographic hash of information in a block using the SHA-256 algorithm.
 *
 * @param {number} index The block index.
 * @param {string} data The data to mined as part of the block.
 * @param {number} timeStamp The time the block was mined or the time the hash is being calculated at.
 * @param {string} prevHash The hash of the previous block in the chain.
 * @param {number} nonce The number of attempts to compute a valid hash. If `computeHash`
 * is being called when trying to find a valid hash, it represents the number of failed attempts
 * thus far.
 * @returns {string} A SHA-256 hash of the provided data.
 */
export const computeHash = (index, data, timeStamp, prevHash, nonce) => {
	const hash = crypto
		.createHash('sha256')
		.update('' + index + timeStamp + data + prevHash + nonce)
		.digest('hex');

	return hash;
};

/**
 * Finds the valid hash for this blockchain and constructs the block ready to be mined.
 *
 * @param {{ index: number; data: string; previousHash: string }} index The block index.
 * @param {string} data The data to be part of the block.
 * @param {string} previousHash The hash of the previous mined block.
 * @returns {{ index, data, timeStamp, hash, previousHash, nonce }} The block ready to be mined.
 */
export const generateBlock = ({ index, data, previousHash }) => {
	let hash = '';
	let nonce = 0;
	let timeStamp;

	while (!isValidHash(hash)) {
		timeStamp = Date.now();
		hash = computeHash(index, data, timeStamp, previousHash, nonce);
		nonce++;
	}
	nonce--; // As the nonce is incremented even after a valid hash is found.

	console.log('valid hash', hash, nonce);

	return { index, data, timeStamp, hash, previousHash, nonce };
};
