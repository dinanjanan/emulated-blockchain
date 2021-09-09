import styled from 'styled-components';

export const BlockContainer = styled.div`
	background: #ffffff;
	box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
		rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
	/* height: 250px; */
	border-radius: 10px;
	padding: 40px 35px;
	transition: all 500ms ease;

	&:hover {
		box-shadow: rgba(0, 0, 0, 0.15) 0px 15px 25px,
			rgba(0, 0, 0, 0.05) 0px 5px 10px;
	}
`;

export const BlockFooter = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 35px;
`;
