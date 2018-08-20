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
  * [Commit message](#commit-message)
  * [Contributing](#contributing)
  * [Preparing a good PR](#preparing-a-good-pr)
  * [Maintaining](#maintaining)
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
We use [Vincent Driessen's branching model.](http://nvie.com/posts/a-successful-git-branching-model/)

Read details here:
- http://nvie.com/posts/a-successful-git-branching-model/
- http://danielkummer.github.io/git-flow-cheatsheet/

To make the git flow experience smoother you can use **custom git commands**(regular shell scripts) -
[git-flow](https://github.com/petervanderdoes/gitflow-avh)

- **[Installation instruction](https://github.com/petervanderdoes/gitflow-avh/wiki/Installing-on-Mac-OS-X)**
- **[git-flow commands](https://github.com/petervanderdoes/gitflow-avh/wiki#reference)**

[Setup](https://github.com/petervanderdoes/gitflow-avh#initialization) a git repository
for **git-flow** usage(store **git-flow** config in .git/config):
```sh
git flow init -d
```

## Commit message
We use [conventional commits specification](https://conventionalcommits.org/) for commit messages.

#### Commitizen
To ensure that all commit messages are formatted correctly, you can use
[Commitizen](http://commitizen.github.io/cz-cli/) cli tool.
It provides interactive interface that creates your commit messages for you.

```sh
npm install -g commitizen
```

From now on, instead of `git commit` you type `git cz` and let the tool do the work for you.

Helpful hint: You can always edit your last commit message, before pushing, by using:
```sh
git commit --amend
```
You should strive for a clear informative commit message.
Read **[How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)**.

## Contributing
After cloning the repo, initialize the local repository with gitflow(if you use it):
```sh
git flow init -d
```

When starting work on a new issue, branch off from the develop branch.
```sh
git checkout -b feature/<feature> develop
# git-flow:
git flow feature start <feature>
```
If your feature/bug/whatever have an github issue then use issue id as feature name.
For instance:
```sh
git checkout -b feature/1 develop
# git-flow:
git flow feature start 1
```
Which mean you start working on #1 issue(/issues/1 regarding the repo).

Then, do work and commit your changes.
```sh
git push origin feature/<fature>
# git-flow:
git flow feature publish <feature>
```
When done, open a pull request to your feature branch.

If you have a permit to close the feature yourself:
```sh
git checkout develop
# Switched to branch 'develop'
git merge --no-ff features/<feature>
# Use --no-ff to avoid losing information about the historical existence of a feature branch
git branch -d features<fature>
# Deleted branch
git push origin develop
```

Same with **git-flow**:
```sh
git flow feature finish
```

## Preparing a good PR

- A pull request should have a specific goal and have a descriptive title.
Do not put multiple unrelated changes in a single pull request
- Do not include any changes that are irrelevant to the goal of the pull request.
This includes refactoring or reformatting unrelated code and changing or adding auxiliary files
(.gitignore, etc.) in a way that is not related to your main changes.
- Make logical, not historical commits. Before you submit your work for review, you should rebase
your branch (**git rebase -i**) and regroup your changes into logical commits.
Logical commits achieve different parts of the pull request goal.
Each commit should have a descriptive commit message.
Logical commits within a single pull request rarely overlap in the lines of code they touch.
- If you want to amend your pull request, rewrite the branch and force-push it instead of
adding new (historical) commits or creating a new pull request.

## Maintaining
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
