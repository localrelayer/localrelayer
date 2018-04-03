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
  padding: 10px 30px;
`;

const ImgContainer = styled.img`
  max-height: 40px;
`;

const RightLinks = styled.div`
  margin-right: 50px;
  img {
    max-height: 30px;
  }
`;

export default () => (
  <NavBar>
    <LogoContainer>
      <ImgContainer src={logo} alt="logo" />
    </LogoContainer>

    <RightLinks>
      <ImgContainer src={zeroEx} alt="Powered by 0x.js" />
    </RightLinks>
  </NavBar>
);
