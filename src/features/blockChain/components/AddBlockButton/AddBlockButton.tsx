import React from 'react';

import { AddBlockButtonContainer } from './AddBlockButton.styles';

type AddBlockButtonProps = {
  onClick: React.MouseEventHandler<HTMLDivElement>;
};

const AddBlockButton = ({ onClick }: AddBlockButtonProps) => {
  return (
    <AddBlockButtonContainer onClick={onClick}>
      <span className="plus--icon">+</span> ADD NEW BLOCK
    </AddBlockButtonContainer>
  );
};

export default AddBlockButton;
