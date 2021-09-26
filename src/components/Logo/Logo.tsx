import React from 'react';
import { StyledLogo } from './Logo.styles';

// import logo from '../../assets/blockchain-transaction.svg';
import logo from '../../assets/blockchain-distribution.svg';

const Logo = () => {
  return <StyledLogo src={logo} alt="Logo" />;
};

export default Logo;
