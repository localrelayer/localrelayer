import React from 'react';
import styled from 'styled-components';
import logo from '../assets/logo.png';
import zeroEx from '../assets/powered-by-0.png';

const NavBar = styled.nav`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LogoContainer = styled.div`
  padding: 25px;
`;

const RightLinks = styled.div`
  margin: 0 50px;

  img {
    height: 40px;
  }
`;

export default () => (
  <NavBar>
    <LogoContainer>
      <img style={{ height: 50 }} src={logo} alt="logo" />
    </LogoContainer>

    <RightLinks>
      <img src={zeroEx} alt="Powered by 0x.js" />
    </RightLinks>
  </NavBar>
);
