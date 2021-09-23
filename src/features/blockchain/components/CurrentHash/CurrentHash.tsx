import React from 'react';
import Paragraph from '../../../../components/Paragraph/Paragraph';

import { CurrentHashValue, CurrentHashContainer } from './CurrentHash.styles';

type CurrentHashProps = {
  hash: string;
  isValidHash: boolean;
};

const CurrentHash = ({ hash, isValidHash }: CurrentHashProps) => {
  return (
    <CurrentHashContainer>
      <Paragraph>HASH</Paragraph>
      <CurrentHashValue isValidHash={isValidHash}>{hash}</CurrentHashValue>
    </CurrentHashContainer>
  );
};

export default CurrentHash;
