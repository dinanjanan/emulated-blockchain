import React from 'react';

import { BlockNonceContainer } from './BlockNonce.styles';

const BlockNonce = ({ nonce }) => {
	return <BlockNonceContainer>{nonce}</BlockNonceContainer>;
};

export default BlockNonce;
