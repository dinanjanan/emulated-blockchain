import React from 'react';
import styled from 'styled-components';

const CreditsContainer = styled.div`
	display: flex;
	justify-content: center;
	align-content: center;
	margin-top: 200px;
`;

const Credits = () => {
	return (
		<CreditsContainer>
			UI inspiration drawn from blockchaindemo.io
		</CreditsContainer>
	);
};

export default Credits;
