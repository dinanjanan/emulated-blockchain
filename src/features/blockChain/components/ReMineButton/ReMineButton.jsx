import React from 'react';

import { ReMineButtonContainer } from './ReMinedButton.styles';

const ReMineButton = ({ onClick }) => {
	return (
		<ReMineButtonContainer onClick={onClick}>
			<i className="fas fa-wrench"></i>
		</ReMineButtonContainer>
	);
};

export default ReMineButton;
