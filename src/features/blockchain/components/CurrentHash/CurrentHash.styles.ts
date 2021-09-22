import styled from 'styled-components';

export type HashValueProps = {
  isValidHash: boolean;
};

export const CurrentHashValue = styled.span<HashValueProps>`
  color: ${props => (props.isValidHash ? '#52c41a' : '#f5222d')};
  font-family: 'Courier New', Courier, monospace;
  font-size: 15px;
  margin-left: 20px;
  background-color: ${props => (props.isValidHash ? '#f6ffed' : '#fff1f0')};
  border-color: ${props => (props.isValidHash ? '#b7eb8f' : '#ffa39e')};
  border: 1px solid;
  padding: 3px 7px 0;
  text-underline-offset: 0;
  border-radius: 4px;
`;

export const CurrentHashContainer = styled.div`
  margin-top: 10px;
`;
