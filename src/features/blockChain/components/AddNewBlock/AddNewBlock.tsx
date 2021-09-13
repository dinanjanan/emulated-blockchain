import React, { useState } from 'react';

import { useAppDispatch } from '../../../../app/hooks';
import { mineBlock } from '../../blockChain.slice';

import Input from '../../../../components/Input/Input';
import AddBlockButton from '../AddBlockButton/AddBlockButton';
import { AddNewBlockContainer } from './AddNewBlock.styles';

const AddNewBlock = () => {
  const dispatch = useAppDispatch();
  const [inputData, setInputData] = useState('');

  const onInputChanged: React.ChangeEventHandler<HTMLInputElement> = e =>
    setInputData(e.target.value);
  const onAddBtnClicked = () => dispatch(mineBlock(inputData));

  return (
    <AddNewBlockContainer>
      <Input labelText="DATA" onChange={onInputChanged} />
      <AddBlockButton onClick={onAddBtnClicked} />
    </AddNewBlockContainer>
  );
};

export default AddNewBlock;
