import React, { useState } from 'react';

import Input from '../../../../components/Input/Input';
import PreviousHash from '../PreviousHash/PreviousHash';
import CurrentHash from '../CurrentHash/CurrentHash';
import BlockDescription from '../BlockDescription/BlockDescription';
import BlockNonce from '../BlockNonce/BlockNonce';
import ReMineButton from '../ReMineButton/ReMineButton';

import { useAppDispatch } from '../../../../app/hooks';
import { updateLatestBlockHashes, reMineBlock } from '../../blockChain.slice';
import { isValidHash } from '../../utils';

import { BlockContainer, BlockFooter } from './Block.styles';
import { Block as BlockModel } from '../../interfaces/BlockChain';

const Block: React.FC<BlockModel> = ({
  index,
  previousHash,
  hash,
  data,
  timeStamp,
  nonce,
}) => {
  const dispatch = useAppDispatch();
  const [inputData, setInputData] = useState(data);

  const onInputChanged: React.ChangeEventHandler<HTMLInputElement> = e => {
    setInputData(e.target.value);
    dispatch(
      updateLatestBlockHashes({ invalidIndex: index, newData: e.target.value }),
    );
  };

  const onReMineClicked = () => {
    dispatch(reMineBlock({ data: inputData, index, previousHash }));
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
