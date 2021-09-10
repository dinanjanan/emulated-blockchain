import styled from 'styled-components';

export const PeersDisplayContainer = styled.div`
	width: 100%;
	height: 250px;

	.peers-list-ops__container {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}
`;

export const PeersList = styled.div`
	display: flex;
	justify-content: flex-start;
	align-items: center;
	margin-left: 20px;
`;

export const AddPeerButton = styled.div`
	background-color: #108ee9;
	padding: 10px 20px;
	border-radius: 4px;
	width: fit-content;
	max-width: 120px;
	max-height: 40px;
	transition: all 500ms ease;
	cursor: pointer;
	color: #ffffff;
	text-align: center;

	&:hover {
		opacity: 0.8;
	}
`;
