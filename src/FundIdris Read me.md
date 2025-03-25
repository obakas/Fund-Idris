# FundIdris

FundIdris is a decentralized crowdfunding smart contract built on Ethereum. It allows users to fund the contract with ETH and enables the contract owner to withdraw the funds securely. The project uses Chainlink's price feeds to ensure that the minimum funding amount is met in USD.

## Features

- **Funding**: Users can fund the contract with ETH, ensuring the value meets a minimum threshold in USD.
- **Withdrawals**: The contract owner can withdraw all funds securely.
- **Optimized Withdrawals**: Includes a `cheaperWithdraw` function for gas-efficient withdrawals.
- **Chainlink Integration**: Uses Chainlink price feeds to convert ETH to USD.
- **Fallback and Receive Functions**: Automatically handles direct ETH transfers to the contract.

## Prerequisites

- Node.js and npm
- Foundry (for testing and deployment)
- Ethereum wallet (e.g., MetaMask)
- Access to a Chainlink price feed

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/fund-idris.git
   cd fund-idris
   forge install
2. Deploy the contract:
   ```bash
   forge script script/DeployFundIdris.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast
3. Run tests:
   ```bash
   forge test

## Project Structure
