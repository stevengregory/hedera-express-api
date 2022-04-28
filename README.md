# Hedera Express API

An experimental [Hedera](https://hedera.com/) API written with Node.js and TypeScript. Uses the [JavaScript SDK](https://github.com/hashgraph/hedera-sdk-js) to interact with the Hedera Hashgraph.

## Prerequisites

- [Node.js](https://nodejs.org/)
- Create a developer [testnet account](https://portal.hedera.com/register) on the Hedera portal

## Setup

Clone the repo and change directory.

```bash
git clone https://github.com/stevengregory/hedera-express-api
cd hedera-express-api
```

In the root directory of your project, create a `.env.hedera` file and add your testnet account `OPERATOR_ID` and `OPERATOR_KEY`. Now set the `HEDERA_NETWORK` to `testnet`.

```.env
# Hedera Operator Account ID
OPERATOR_ID = ENTER YOUR ACCOUNT ID

# Hedera Operator Private Key
OPERATOR_KEY = ENTER YOUR PRIVATE KEY

# Hedera Network
HEDERA_NETWORK = testnet
```

## Installation

Install the npm packages.

```bash
npm install
```

## Run the app

Run the application in dev mode.

```bash
npm run dev
```

## Run tests

Run the unit tests.

```bash
npm run tests
```
