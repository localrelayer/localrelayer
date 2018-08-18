# Instex
Instex is a dApp(decentralized application) built on top of [0x protocol](https://0xproject.com/).
It helps traders discover counter-parties and ferry cryptographically signed orders between them.

The project on an experimental stage in attempts to find their own way and take the place in
the new decentralized world.
At this stage, we are working on UI and API interfaces for the open orderbook node(relayer)
which will be ready for connection in shared liquidity pool with other relayers.

This document and all mentioned references are required for reading to every new Instex developer.

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Table of Contents
- [Usage](#usage)
  * [Git flow](#git-flow)
- [Basic concepts](#basic-concepts)
- [Glossary](#glossary)
  * [0x protocol](#0x-protocol)
  * [Web3](#web3)
  * [MetaMask](#metamask)
  * [WETH](#weth)
  * [Order book](#order-book)
  * [Maker and Taker](#maker-and-taker)
  * [Relayer](#relayer)
  * [Shared liquidity](#shared-liquidity)

# Usage
WIP...

## Git flow
WIP...

# Basic concepts
**Instex** is a **relayer** with **open order book strategie** built on top of **0x protocol**.
If you're brand new to **Instex** and want to understand the basic concepts, see:

- The **[Definition](https://en.wikipedia.org/wiki/Order_book_(trading))** of order book
- The simple interactive **[Explanation](https://relayer.network/)** of what DEX and relayer are
- The ERC-20 Token Allowance Function **[Explanation](https://tokenallowance.io/)**
- **[WTF is W-ETH?](https://weth.io/)**
- **[Getting started](https://tokenallowance.io/)** article with an overview of 0x protocol
- **[Open Orderbook strategie](https://0xproject.com/wiki#Open-Orderbook)**
- **[0x project white paper](https://0xproject.com/pdfs/0x_white_paper.pdf)**

# Glossary
List of basic items which you have to understand to work on the project.

## 0x Protocol
**[0x](https://0xproject.com/)** is an open, permissionless protocol allowing for ERC20 tokens
to be traded on the Ethereum blockchain.

## Web3
**[web3](https://github.com/ethereum/web3.js/)** This is the Ethereum compatible
[JavaScript API](https://github.com/ethereum/wiki/wiki/JavaScript-API) which implements the
[Generic JSON RPC](https://github.com/ethereum/wiki/wiki/JSON-RPC) spec.

## Metamask
**[Metamask](https://metamask.io/)** is a wallet, at it’s core, implemented as a browser extension.

## WETH
**[WETH](https://weth.io/)** - is ETH wrapped by smart contract allows you to trade directly with alt tokens.

## Order book
**[Order book](https://en.wikipedia.org/wiki/Order_book_(trading))** - is the list of buy and sell orders.
Order book can be stored as on-chain or off-chain.

## Maker and Taker
There are two parties involved in every trade, a **maker** and a **taker**.
The maker creates an order for an amount of TokenA in exchange for an amount of TokenB.
The maker then submits these to a relayer. Takers discover orders via a relayer and fill them by
sending them directly to the 0x protocol smart contracts.
The 0x protocol smart contracts performs an atomic swap, exchanging the maker and taker tokens.

## Relayer
**[A relayer](https://0xproject.com/wiki#Build-A-Relayer)** - is any party or entity which hosts
an off-chain orderbook.  They provide a way for users to add, remove and update this orderbook
through an API, GUI or both. In doing so, relayers help traders discover counter-parties and ferry
cryptographically signed orders between them. Once two parties agree on the terms of an order,
the order is settled directly on the Ethereum blockchain via the 0x protocol smart contracts.

## Shared liquidity
Because all relayers represent orders using the 0x protocol order format, an order created on one
relayer can be filled by users on another relayer. What this means is that rather than each
relayer having a siloed liquidity pool, they can share orders to create a shared liquidity pool.
New relayers can bootstrap their liquidity off of existing relayers, immediately becoming an
interesting place to trade.
