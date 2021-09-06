import React from 'react';
import P from '../../../../components/P/P';

import { CurrentHashValue, CurrentHashContainer } from './CurrentHashStyles';

const CurrentHash = ({ hash }) => {
	return (
		<CurrentHashContainer>
			<P>HASH</P>
			<CurrentHashValue>{hash}</CurrentHashValue>
		</CurrentHashContainer>
	);
};

export default CurrentHash;
