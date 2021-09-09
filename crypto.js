const crypto = require('crypto');

// Hash-based Message Authentication
crypto.createHmac('sha256', 'key').update('data').digest('hex');

// Ciphers - Allow you to encode and decode messages given a password.
//
// A good cipher algorithm is AES-256

/**
 * Crypto comes with two methods for ciphering and deciphering:
 *  crypto.createCipheriv(algorithm, key, iv);
 *  crypto.createDecipheriv(algorithm, key, iv);
 *
 * Initialisation Vectors (iv) must be unpredictable and unique, typically requied to e random or pseudorandom. Randomization is crucial for encryption schemes to achieve semantic security, a property whereby repeated usage of the scheme under tthe same key does not allow an attacker to infer relationships between segments of the encrypted message.
 */
