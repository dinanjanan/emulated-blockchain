import React, { useState } from 'react';

import Input from '../../../../components/Input/Input';
import PreviousHash from '../PreviousHash/PreviousHash';
import CurrentHash from '../CurrentHash/CurrentHash';
import BlockDescription from '../BlockDescription/BlockDescription';
import BlockNonce from '../BlockNonce/BlockNonce';
import ReMineButton from '../ReMineButton/ReMineButton';

import { useAppDispatch } from '../../../../app/hooks';
import { updateLatestBlockHashes, reMineBlock } from '../../blockchain.slice';
import { isValidHash } from '../../utils';

import { BlockContainer, BlockFooter } from './Block.styles';
import { Block as BlockModel } from '../../blockchain.types';

const Block: React.FC<BlockModel> = ({
  id: blockId,
  index,
  previousHash,
  hash,
  data,
  timeStamp,
  nonce,
}) => {
  const dispatch = useAppDispatch();
  const [inputData, setInputData] = useState(data);

  // When the active peer changes, we need to update the data in the input field to reflect the blockchain of the currently active peer.
  if (data !== inputData) setInputData(data);

  const onInputChanged: React.ChangeEventHandler<HTMLInputElement> = e => {
    setInputData(e.target.value);
    dispatch(
      updateLatestBlockHashes({ invalidIndex: index, newData: e.target.value }),
    );
  };

  const onReMineClicked = () => {
    dispatch(
      reMineBlock({ id: blockId, data: inputData, index, previousHash }),
    );
  };

  return (
    <BlockContainer>
      <Input labelText="DATA" value={inputData} onChange={onInputChanged} />
      <PreviousHash
        previousHash={previousHash}
        isValidHash={isValidHash(previousHash)}
      />
      <CurrentHash hash={hash} isValidHash={isValidHash(hash)} />
      <BlockFooter>
        <BlockDescription {...{ index, timeStamp }}></BlockDescription>
        {isValidHash(hash) ? (
          <BlockNonce nonce={nonce} />
        ) : (
          <ReMineButton onClick={onReMineClicked} />
        )}
      </BlockFooter>
    </BlockContainer>
  );
};

export default Block;
