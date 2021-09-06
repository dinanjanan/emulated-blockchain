import React from 'react';

import { BlockNonceContainer } from './BlockNonceStyles';

const BlockNonce = ({ nonce }) => {
	return <BlockNonceContainer>{nonce}</BlockNonceContainer>;
};

export default BlockNonce;
