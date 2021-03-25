# Local Relayer (NOT SUPPORTED)
Local Relayer is a dApp(decentralized application) built on top of [0x protocol](https://0xproject.com/) v2.
It helps traders to discover counter-parties and ferry cryptographically signed orders between them.

The project on an experimental stage in attempts to find the way and to take the place in
the new decentralized world.
At this stage, we are working on UI and API interfaces for the open orderbook node(relayer)
which will be ready for connection in shared liquidity pool with other relayers.

LocalReayer is live on **Mainnet** and **Kovan** https://app.localrelayer.com.

You need to use Metamask to interact with exchange.

**There are still plenty of bugs and some things can go wrong, so be aware.**

This document and all mentioned references are required for reading by every developer who wants to contibute to Local Relayer.

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

Jump to:

- [Local Relayer](#local-relayer)
- [Request for improvement](#request-for-improvements)
- [Usage](#usage)
  - [Git flow](#git-flow)
  - [Commit message](#commit-message)
      - [Commitizen](#commitizen)
  - [Opening an issue](#issue)
  - [Contributing](#contributing)
  - [Preparing a good PR](#preparing-a-good-pr)
- [Basic concepts](#basic-concepts)
- [Glossary](#glossary)
  - [0x Protocol](#0x-protocol)
  - [Web3](#web3)
  - [Metamask](#metamask)
  - [WETH](#weth)
  - [Order book](#order-book)
  - [Maker and Taker](#maker-and-taker)
  - [Relayer](#relayer)
  - [Shared liquidity](#shared-liquidity)
- [Base/Quote pair and Bid/Ask price explanation](#basequote-pair-and-bidask-price-explanation)
- [Test Ethereum accounts](#test-ethereum-accounts)
- [Contacts](#contacts)
- [Support](#support)

# Request for improvements

Currently there are multiple parts of the project that requires maintaining, refactoring or rewriting.
Feel free to create issues and/or PRs for any missing or wrongly working functionality.

Here is not full list of things that needs to be done:

- Change TradingView chart to open source alternative
- Dockerize the project
- CI/CD
- Create documentation
- Fix linting on ui and api packages
- Fix tests on ui packages
- Fix storybook on ui packages
- Redesign
- Custom Theming Support
- Reduce ui bundle size
- Improve trading emulator
- Increase test coverage
- and much more...

# Usage
The repo consist of 2 parts - **api** and **ui**.
Each of this part is a separated module with own **Usage** documentation which described how to run it.

At this moment modules not connect with each other by yarn workspaces or lerna packages, so they don't have hoisted or shared dependencies.
We store it in one repository for the consistent version control.
It means all these packages have the same version number.
Therefore when we schedule a new version, the milestone may have issues for any part of the project.

We use [SemVer](http://semver.org/) specification whuch dictate how version numbers are assigned and incremented.

Each new **Major** and **Minor** version changes is scheduled in
**[github milestones](https://github.com/localrelayer/localrelayer/milestones)** so you can track the progress
right on the github.
**Patch** versions is for hotfixes or features which we need to deploy for some reason right now.

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
sudo npm install -g commitizen cz-customizable
```

From now on, instead of `git commit` you type `git cz` and let the tool do the work for you.

The following commit types are used on the project:
- **feat** - A new feature
- **fix**- A bug fix
- **improvement** - Improve a current implementation without adding a new feature or fixing a bug
- **docs** - Documentation only changes
- **style** - Changes that do not affect the meaning of the code(white-space, formatting, missing semi-colons, etc)
- **refactor** - A code change that neither fixes a bug nor adds a feature
- **perf** - A code change that improves performance
- **test** - Adding missing tests
- **chore** - Changes to the build process or auxiliary tools and libraries such as documentation generation
- **revert** - Revert to a commit
- **WIP** - Work in progress

You should strive for a clear informative commit message.
Read **[How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)**.

**Helpful hint**: You can always edit your last commit message, before pushing, by using:
```sh
git commit --amend
```

## Issue

For feature request or bug please open an issue with proposed templates.

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
If your feature/bug/whatever have an **github issue** then use issue id as feature name.
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
git merge --no-ff feature/<feature>
# Use --no-ff to avoid losing information about the historical existence of a feature branch
git branch -d feature<fature>
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

# Basic concepts
**Local Relayer** is a **relayer** utilizing **open order book strategy** built on top of **0x protocol**.
If you're brand new to **Local Relayer** and want to understand the basic concepts, see:

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
The maker then submits these to a relayer. The taker discovers orders via a relayer and fill them by
sending them directly to the 0x protocol smart contracts.
The 0x protocol smart contracts performs a swap, exchanging the maker and taker tokens.

## Relayer
**[A relayer](https://0xproject.com/wiki#Build-A-Relayer)** - is any party or entity which hosts
an off-chain orderbook. They provide a way for users to add, remove and update this orderbook
through an API, GUI or both. In doing so, relayers help traders discover counter-parties and ferry
cryptographically signed orders between them. Once two parties agree on the terms of an order,
the order is settled directly on the Ethereum blockchain via the 0x protocol smart contracts.

## Shared liquidity
Because all relayers represent orders using the 0x protocol order format, an order created on one
relayer can be filled by users on another relayer. That means - rather than each
relayer would have own liquidity pool, all relayers can share orders to create a shared liquidity pool.
New relayers can bootstrap their liquidity off of existing relayers, immediately becoming an
interesting place to trade and big relayers can get additional fee income from those new relayers.

# Base/Quote pair and Bid/Ask price explanation

![bid/ask mindmap](https://user-images.githubusercontent.com/555405/46295019-c6c3e900-c59f-11e8-9655-076ee97f736d.png)

# Test Ethereum accounts

Use this accounts during development

**Wallet backup phrase**
```
stereo cheese harsh ordinary scrub media chair beauty artist poet ranch attack
```

**Password (you can create your own or use this one just for the convention)**
```
localrelayerMetamask
```

**Testnet ZRX address**
```
0x871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c
```

**Testnet WETH address**
```
0x0b1ba0af832d7c05fd64161e0db78e85978e8082
```

Wilder and Joshua - account names for the simplicity.

**Wilder(Account 1)**
```
0x8449D9bC71BF910c8D22a3443953Ec303E73759D
```
Key
```
90CD05587A4940CF090FE35600EF35B9F962D25BB86D55CB804C6165628FE9DF
```

**Joshua(Account 2)**
```
0xFEF5930dD4f9dfb74f667f2dA4F47B665C6af5f5
```
Key
```
4F6B18AF7C44ED58C29EF93857CEE839EAB6559FD8164554C3368E6858B159BD
```

**testFeeRecipient(Account 3)**
```
0xc6c3D375B62D66fe0A796eD4ac30bD09fF2D1BE5
```
Key
```
E9037D55FAF01CFC97EAA01F8C2E6B1415A94A99231A9C8AE8E7D17D1EE23B78
```

## Contacts

Join our telegram chat https://t.me/localrelayer
For propositions and partnerships please contant us by email hi@localrelayer.com

## Support

You can support development by donation:

ETH: 0x98da50c21af5c48c2b524c89f71588adbd985790

-----

*Initially developed by [Tim Reznich](https://github.com/imbaniac) and [Vladimir Pal](https://github.com/VladimirPal)*

*Currently developed by [LambdaBird](https://lambdabird.com/) team*
