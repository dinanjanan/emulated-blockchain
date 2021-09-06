import styled from 'styled-components';

export const InputContainer = styled.span`
	color: rgba(0, 0, 0, 0.65);
	display: table;
`;

export const Label = styled.span`
	font-weight: 400;
	font-size: 14px;
	position: relative;
`;

export const LabelContainer = styled.span`
	padding: 4px 18px 8px;
	background-color: #fafafa;
	border: 1px solid #d9d9d9;
	border-radius: 0;
	border-top-left-radius: 4px;
	border-bottom-left-radius: 4px;
	position: relative;
	display: table-cell;
	position: relative;
`;

export const InputField = styled.input`
	font-size: 12px;
	min-height: 100%;
	min-width: 15rem;
	width: 100%;
	padding: 8px 22px 8px;
	color: rgba(0, 0, 0, 0.65);
	border-top-right-radius: 4px;
	border-bottom-right-radius: 4px;
	position: relative;
	transition: all 500ms ease;

	&:focus {
		border: 1px solid #40a9ff;
		box-shadow: #40a9ff99 0px 0px 6px;
	}
`;

export const InputFieldContainer = styled.span`
	/* padding: 4px 11px 8px; */
	border: 1px solid #d9d9d9;
	width: 100%;
	border-left: none;
	border-radius: 0;
	border-top-right-radius: 4px;
	border-bottom-right-radius: 4px;
	display: table-cell;
`;

export const ImageContainer = styled.span`
	position: relative;
`;

export const Image = styled.img`
	height: 17px;
`;

/*
import styled from 'styled-components';

export const InputContainer = styled.span`
	color: rgba(0, 0, 0, 0.65);
	display: table;
`;

export const Label = styled.span`
	font-weight: 400;
	font-size: 14px;
	position: relative;
`;

export const LabelContainer = styled.span`
	padding: 4px 18px 8px;
	background-color: #fafafa;
	border: 1px solid #d9d9d9;
	border-radius: 0;
	border-top-left-radius: 4px;
	border-bottom-left-radius: 4px;
	position: relative;
	display: table-cell;
`;

export const InputField = styled.input`
	font-size: 12px;
	min-height: 100%;
	min-width: 15rem;
	width: 100%;
	padding: 4px 11px;
	color: rgba(0, 0, 0, 0.65);

	`;

	export const InputFieldContainer = styled.span`
		padding: 4px 11px 8px;
		border: 1px solid #d9d9d9;
		width: 100%;
		border-left: none;
		border-radius: 0;
		border-top-right-radius: 4px;
		border-bottom-right-radius: 4px;
		display: table-cell;
	`;
	
	export const ImageContainer = styled.span`
		position: relative;
	`;
	
	export const Image = styled.img`
		height: 17px;
	`;
	
*/
