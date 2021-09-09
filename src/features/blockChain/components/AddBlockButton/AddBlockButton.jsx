import React from 'react';

import { AddBlockButtonContainer } from './AddBlockButton.styles';

const AddBlockButton = ({ onClick }) => {
	return (
		<AddBlockButtonContainer onClick={onClick}>
			<span className="plus--icon">+</span> ADD NEW BLOCK
		</AddBlockButtonContainer>
	);
};

export default AddBlockButton;
