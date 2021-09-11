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
	width: calc(100vw - 210px);
	overflow: hidden;
`;

export const AddPeerButton = styled.div`
	background-color: #108ee9;
	padding: 10px 20px;
	border-radius: 4px;
	width: fit-content;
	max-width: 110px;
	max-height: 40px;
	min-width: 110px;
	min-height: 40px;
	transition: all 500ms ease;
	cursor: pointer;
	color: #ffffff;
	text-align: center;
	z-index: 5;

	&:hover {
		opacity: 0.8;
	}
`;

export const PeersListContainer = styled.div`
	width: calc(100vw - 300px);
	display: flex;
	justify-content: flex-start;
	align-items: center;
`;
