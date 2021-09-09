import React from 'react';
import Paragraph from '../../../../components/Paragraph/Paragraph';

import { CurrentHashValue, CurrentHashContainer } from './CurrentHash.styles';

const CurrentHash = ({ hash, isValidHash }) => {
	return (
		<CurrentHashContainer>
			<Paragraph>HASH</Paragraph>
			<CurrentHashValue isValidHash={isValidHash}>{hash}</CurrentHashValue>
		</CurrentHashContainer>
	);
};

export default CurrentHash;
