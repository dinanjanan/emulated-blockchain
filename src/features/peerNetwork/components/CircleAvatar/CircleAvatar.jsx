import React from 'react';
import styled from 'styled-components';

const CircleAvatarContainer = styled.div`
	height: 40px;
	width: 40px;
	border-radius: 50%;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 15px;
	background-color: ${props => props.backgroundColor};
	color: ${props => props.color};
`;

const CircleAvatar = ({ connectionState }) => {
	return (
		<CircleAvatarContainer {...connectionState}>
			<i className="far fa-user" />
		</CircleAvatarContainer>
	);
};

export default CircleAvatar;
