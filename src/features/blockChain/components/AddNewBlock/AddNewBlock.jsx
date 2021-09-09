import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { mineBlock } from '../../blockChain.slice';

import Input from '../../../../components/Input/Input';
import AddBlockButton from '../AddBlockButton/AddBlockButton';
import { AddNewBlockContainer } from './AddNewBlock.styles';

const AddNewBlock = () => {
	const dispatch = useDispatch();
	const [inputData, setInputData] = useState('');

	const onInputChanged = e => setInputData(e.target.value);
	const onAddBtnClicked = () => dispatch(mineBlock(inputData));

	return (
		<AddNewBlockContainer>
			<Input labelText="DATA" onChange={onInputChanged} />
			<AddBlockButton onClick={onAddBtnClicked} />
		</AddNewBlockContainer>
	);
};

export default AddNewBlock;
