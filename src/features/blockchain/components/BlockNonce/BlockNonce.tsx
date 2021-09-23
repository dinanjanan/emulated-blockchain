import React from 'react';

import { BlockNonceContainer } from './BlockNonce.styles';

type BlockNonceProps = {
  nonce: number;
};

const BlockNonce = ({ nonce }: BlockNonceProps) => {
  return <BlockNonceContainer>{nonce}</BlockNonceContainer>;
};

export default BlockNonce;
