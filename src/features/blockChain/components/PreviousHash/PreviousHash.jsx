import React from 'react';
import P from '../../../../components/P/P';
import { PreviousHashValue, PreviousHashContainer } from './PreviousHashStyles';

const PreviousHash = ({ previousHash }) => {
	return (
		<PreviousHashContainer>
			<P>PREVIOUS HASH</P>
			<PreviousHashValue>{previousHash}</PreviousHashValue>
		</PreviousHashContainer>
	);
};

export default PreviousHash;
