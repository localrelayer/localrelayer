import React from 'react';
import styled from 'styled-components';
import medium from '../assets/medium.png';
import twitter from '../assets/twitter.png';
import telegram from '../assets/telegram.png';
import email from '../assets/email.svg';

const Footer = styled.footer`
  padding: 50px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const ImageContainer = styled.a`
  display: flex;
  align-items: center;
  padding: 5px;
`;

const Img = styled.img`
  height: 50px;
`;

const Contact = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  background: #00000054;
  padding: 50px 0;
  @media (max-width: 960px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Links = styled.div`
  margin-top: 50px;
  display: flex;
`;

const TextContainer = styled.div`
  font-size: 1.1rem;
  margin-right: 10%;
  @media (max-width: 960px) {
    padding: 0 50px;
  }
`;

const GetInTouch = styled.div`
  margin-top: 20px;
  a {
    all: unset;
    font-weight: 500;
    cursor: pointer;
    text-decoration: underline;
  }
`;

const Legal = styled.div`
  margin-top: 50px;
`;

export default () => (
  <Footer>
    <Contact>
      <TextContainer>
        <h1>How to follow the project</h1>
        <article>
          Want to integrate with our trading API?
          <br />
          Looking for coding or help to integrate your project with our exchange?
          <br />
          Want to discuss partnership?
          <br />
        </article>
        <GetInTouch>
          <a href="mailto:hi@instex.io">
            Get in touch <img style={{ height: 30, marginLeft: 10 }} src={email} alt="Email icon" />
          </a>
        </GetInTouch>
      </TextContainer>
      <Links>
        <ImageContainer target="_blank" rel="noopener" href="https://t.me/instex">
          <Img src={telegram} alt="telegram" />{' '}
        </ImageContainer>
        <ImageContainer target="_blank" rel="noopener" href="https://twitter.com/Instex_0x">
          <Img src={twitter} alt="twitter" />{' '}
        </ImageContainer>
        <ImageContainer target="_blank" rel="noopener" href="https://medium.com/instex">
          <Img src={medium} alt="medium" />{' '}
        </ImageContainer>
      </Links>
    </Contact>
    <Legal>© 2018 Instex</Legal>
  </Footer>
);
