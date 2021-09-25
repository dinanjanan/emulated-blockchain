import React from 'react';
import styled from 'styled-components';

import { ConnectionStates } from '../../../../app/constants';

type CircleAvatarContainerProps = {
  backgroundColor: string;
  color: string;
};

type CircleAvatarProps = {
  connectionState: typeof ConnectionStates[keyof typeof ConnectionStates];
};

const CircleAvatarContainer = styled.div<CircleAvatarContainerProps>`
  height: 40px;
  width: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
  background-color: ${props => props.backgroundColor};
  color: ${props => props.color};
  transition: background-color 1000ms ease;
`;

const CircleAvatar = ({ connectionState }: CircleAvatarProps) => {
  return (
    <CircleAvatarContainer {...connectionState}>
      <i className="far fa-user" />
    </CircleAvatarContainer>
  );
};

export default CircleAvatar;
