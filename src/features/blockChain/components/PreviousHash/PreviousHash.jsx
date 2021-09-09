import React from 'react';
import Paragraph from '../../../../components/Paragraph/Paragraph';
import {
	PreviousHashValue,
	PreviousHashContainer,
} from './PreviousHash.styles';

const PreviousHash = ({ previousHash, isValidHash }) => {
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
