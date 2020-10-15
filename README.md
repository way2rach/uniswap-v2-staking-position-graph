# Uniswap V2 Subgraph - Staking Positions

[Uniswap](https://uniswap.org/) is a decentralized protocol for automated token exchange on Ethereum.

This subgraph dynamically tracks the staking position of the UNI Mining Pool.


## Running Locally

Make sure to update package.json settings to point to your own graph account.

## Example Queries

This query fetches mining position info.

```graphql
{
  miningPositions(first: 5) {
    id
    user {
      id
    }
    miningPool {
      id
    }
    balance
  }
}


```
