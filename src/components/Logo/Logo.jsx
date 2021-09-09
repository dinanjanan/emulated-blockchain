import React from 'react';
import { StyledLogo } from './Logo.styles';

import logo from '../../assets/logo.png';

const Logo = () => {
	return <StyledLogo src={logo} alt="Logo" />;
};

export default Logo;
