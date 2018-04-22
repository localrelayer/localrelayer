import styled from 'styled-components';
import { Layout } from 'antd';

export const FooterContainer = styled(Layout.Footer)`
  display: flex;
`;

export const LinksContainer = styled.div`
  a {
    color: rgba(255, 255, 255, 0.85);
    text-decoration: underline;
    margin: 0 10px;
  }
`;

