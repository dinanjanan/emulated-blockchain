import React from 'react';
import Paragraph from '../../../../components/Paragraph/Paragraph';
import {
  PreviousHashValue,
  PreviousHashContainer,
} from './PreviousHash.styles';

export type PreviousHashProps = {
  previousHash: string;
  isValidHash: boolean;
};

const PreviousHash = ({ previousHash, isValidHash }: PreviousHashProps) => {
  return (
    <PreviousHashContainer>
      <Paragraph>PREVIOUS HASH</Paragraph>
      <PreviousHashValue isValidHash={isValidHash}>
        {previousHash}
      </PreviousHashValue>
    </PreviousHashContainer>
  );
};

export default PreviousHash;
