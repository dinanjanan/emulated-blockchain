import styled from 'styled-components';

const DownChevron = styled.div`
	&::before,
	&::after {
		margin: 50px auto;
		content: '';
		background-color: rgba(0, 0, 0, 0.65);
		padding: 3px 25px 0 0;
		border-radius: 4px;
		display: inline-block;
	}

	&::before {
		transform: rotate(45deg) translate(6px);
	}

	&::after {
		transform: rotate(-45deg) translate(-6px);
	}
`;

export default DownChevron;
