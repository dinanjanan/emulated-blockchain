import styled from 'styled-components';

export const PreviousHashValue = styled.span`
	color: ${props => (props.isValidHash ? '#52c41a' : '#f5222d')};
	font-family: 'Courier New', Courier, monospace;
	font-size: 12px;
	margin-left: 20px;
`;

export const PreviousHashContainer = styled.div`
	margin-top: 20px;
`;
