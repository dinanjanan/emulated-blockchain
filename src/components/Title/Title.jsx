import styled from 'styled-components';

const Title = styled.h1`
	font-weight: 500;
	font-size: ${props => (props.heading ? '55px' : '40px')};
	letter-spacing: 3px;
	margin-bottom: 40px;
`;

export default Title;
