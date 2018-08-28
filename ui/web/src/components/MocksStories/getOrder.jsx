import React, {
  Component,
} from 'react';
import {
  coreMocks,
} from 'instex-core';
import ReactJson from 'react-json-view';
import styled from 'styled-components';

export default class GetOrder extends Component {
  constructor() {
    super();
    this.state = {
      show: false,
    };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      show: !this.state.show,
    });
  }

  render() {
    return (
      <Wrapper>
        <Button onClick={this.toggle}>getOrder</Button>
        {this.state.show
          ? (
            <div>
              <h2>Order</h2>
              <ReactJson src={coreMocks.getOrder()} />
            </div>
          )
          : null}
      </Wrapper>
    );
  }
}

const Wrapper = styled.div`
  margin-left: 50px;
`;

const Button = styled.button`
  background: #000;
  color: #fff;
  border:0;
  padding: 10px 30px;
  margin: 20px auto;
`;
