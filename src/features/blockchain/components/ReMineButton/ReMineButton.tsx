import React from 'react';

import { ReMineButtonContainer } from './ReMinedButton.styles';

type ReMineButtonProps = {
  onClick: React.MouseEventHandler<HTMLDivElement>;
};

const ReMineButton = ({ onClick }: ReMineButtonProps) => {
  return (
    <ReMineButtonContainer onClick={onClick}>
      <i className="fas fa-wrench"></i>
    </ReMineButtonContainer>
  );
};

export default ReMineButton;
