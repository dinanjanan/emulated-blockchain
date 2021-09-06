import React from 'react';
import Input from '../../components/Input/Input';
import AddBlockButton from './components/AddBlockButton/AddBlockButton.jsx';
import { AddNewBlockContainer } from './AddNewBlockStyles';

const AddNewBlock = () => {
	return (
		<AddNewBlockContainer>
			<Input labelText="DATA" />
			<AddBlockButton />
		</AddNewBlockContainer>
	);
};

export default AddNewBlock;
