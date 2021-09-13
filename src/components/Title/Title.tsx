import styled from 'styled-components';

export type TitleProps = { readonly heading?: boolean };

const Title = styled.h1<TitleProps>`
  font-weight: 500;
  font-size: ${props => (props.heading ? '55px' : '40px')};
  letter-spacing: 3px;
  margin-bottom: 40px;
`;

export default Title;
