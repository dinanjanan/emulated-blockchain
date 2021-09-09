import React from 'react';
import {
	InputContainer,
	Label,
	LabelContainer,
	InputField,
	InputFieldContainer,
} from './Input.styles';

// import fileIcon from '../../assets/file.png';

const Input = ({ labelText, ...otherInputProps }) => {
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
