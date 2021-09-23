import styled from 'styled-components';

export const AddNewBlockContainer = styled.div`
	background-color: #ffffff;
	box-shadow: rgba(0, 0, 0, 0.3) 0px 5px 30px, rgba(0, 0, 0, 0.05) 0px 15px 30px;
	border-radius: 10px;
	margin-top: 70px;
	padding: 50px;
	transition: all 300ms ease;

	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	&:hover {
		box-shadow: rgba(0, 0, 0, 0.15) 0px 60px 100px;
	}
`;
