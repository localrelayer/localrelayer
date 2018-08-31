import React, {
  Component,
} from 'react';
import {
  coreMocks,
} from 'instex-core';
import ReactJson from 'react-json-view';
import styled from 'styled-components';

export default class GetFeeRecipients extends Component {
  constructor() {
    super();
    this.state = {
      show: false,
    };
  }

  toggle() {
    this.setState({
      show: !this.state.show,
    });
  }

  render() {
    return (
      <Wrapper>
        <Button onClick={this.toggle.bind(this)}>getFeeRecipients</Button>
        {this.state.show ?
          <ReactJson src={coreMocks.getFeeRecipients()}/>
          : null}
      </Wrapper>
    );
  }
}

const order = coreMocks.getFeeRecipients();

const records = order.records.map((number) =>
  <li>{number}</li>
);

const Wrapper = styled.div`
  margin-left: 50px;
`;

const Button = styled.button`
  background: #000;
  color: #fff;
  border:0;
  padding: 10px 30px;
  margin: 20px auto;
`
