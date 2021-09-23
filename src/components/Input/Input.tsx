import React from 'react';
import {
  InputContainer,
  Label,
  LabelContainer,
  InputField,
  InputFieldContainer,
} from './Input.styles';

// import fileIcon from '../../assets/file.png';

type InputProps = {
  labelText: string;
  [prop: string]: any;
};

const Input = ({ labelText, ...otherInputProps }: InputProps) => {
  return (
    <InputContainer>
      <LabelContainer>
        <Label>{labelText}</Label>
      </LabelContainer>
      <InputFieldContainer>
        {/* <ImageContainer>
					<Image src={fileIcon} alt="File icon indicating data" />
				</ImageContainer> */}
        <InputField {...otherInputProps} />
      </InputFieldContainer>
    </InputContainer>
  );
};

export default Input;
