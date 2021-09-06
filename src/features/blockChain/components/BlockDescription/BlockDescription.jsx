import React from 'react';

import {
	BlockMessage,
	TimeStamp,
	BlockDescriptionContainer,
} from './BlockDescriptionStyles';

const BlockDescription = ({ index, timeStamp }) => {
	const message = index === 0 ? 'GENESIS BLOCK' : `BLOCK #${index}`;
	const timeStampMessage = new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		weekday: 'short',
		month: 'short',
		year: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		timeZone: 'GMT',
	}).format(new Date(timeStamp));

	return (
		<BlockDescriptionContainer>
			<BlockMessage>{message}</BlockMessage>
			<TimeStamp>on {timeStampMessage} GMT</TimeStamp>
		</BlockDescriptionContainer>
	);
};

export default BlockDescription;
