// @flow
import React from 'react';
import { FaqContainer, Question } from './styled';

type Props = {};

/**
 * Twitter news
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

export default () => (
  <FaqContainer>
    <h1>Frequently Asked Questions</h1>
    <div className="faq">
      <article className="wrapper">
        <div className="qa-container">
          <Question>What is Instex?</Question>
          <p className="a">
            Instex is one of the first Ethereum based decentralized exchanges to support
            real-time trading and high transaction throughput.
            Instex supports limit orders, gas-free cancels, and the ability to fill many
            trades at once. Due to our matching engine we eliminated front-running problem too.
          </p>
        </div>
        <div className="qa-container">
          <Question>How to use Instex?</Question>
          <p className="a">
            You need to get
            <a target="_blank" rel="noopener noreferrer" href="https://goo.gl/forms/R5vADvEL1c4Q6gI43"> Metamask </a>
            or <a target="_blank" rel="noopener noreferrer" href="https://goo.gl/forms/R5vADvEL1c4Q6gI43"> Ledger </a>
            to sign orders on Instex. Here is our official guide
            on how to create your first order.
          </p>
        </div>
        <div className="qa-container">
          <Question>How does Instex work?</Question>
          <p className="a">
            Instex utilizes 0x protocol and our own matching engine. The 0x protocol is responsible for trustlessly storing all assets and
            executing trade settlement, and all trades must be signed by the user’s private
            keys.
          </p>
          <p className="a">
            Your tokens never leaves your wallet, all you need to do it to allow 0x protocol to exchange tokens.
          </p>
        </div>
        <div className="qa-container">
          <Question>What are the fees to trade on Instex?</Question>
          <p className="a">
            While in beta, only gas fee is taken (~$1)
            Instex will charge 0.3% fee for every successful transaction after beta.
            Fee will be deducted from receiving token amount.
          </p>
        </div>
        <div className="qa-container">
          <Question>What are gas fees?</Question>
          <p className="a">
            Ethereum transactions cost gas - a fee that is paid to miners in order
            to process the transaction. Each trade on Instex cost ~200k-300k gas. But this amount is distributed between
            2 or more trading sides.
          </p>
        </div>
        <div className="qa-container">
          <Question>Who pays the gas fees?</Question>
          <p className="a">
            Wrapping, unwrapping and allowing transactions gas fees paid by user directly.
            For order matching Instex pays the gas fee to the network and deducts this fee from the user’s
            transaction.
          </p>
        </div>
        <div className="qa-container">
          <Question>Why are there minimum trade orders on Instex?</Question>
          <p className="a">
            Instex has a minimum order of 0.005 ETH.
          </p>
          <p className="a">
            We want to provide you with best price but this price doesn’t account for the cost of gas. If
            there were no minimum order, then users would be able to create order more expensive than gas price.
          </p>
        </div>
        <div className="qa-container">
          <Question>Are my funds safe on Instex?</Question>
          <p className="a">
            We never hold your assets - they are stored on your wallet. You only give allowance to trade
            your tokens with 0x protocol
          </p>
        </div>
      </article>
    </div>
  </FaqContainer>
);
