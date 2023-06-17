# Crypto Token (CT) DAO with Delegated Voting
This project demonstrates a full stack DAO project governed by an ERC-20 token. The DAO contract manages proposals that token holders can vote on to distribute tokens held by the DAO treasury to proposal recipients. The DAO contract allows for token holders to delegate their votes to other DAO members. The front-end allows users to interact with the DAO contract to submit new proposals, delegate votes, vote on proposals, and finalize proposals. Test files and scripts for deployment are included.

## Proposal Life Cycle
Step 0a: Deploy Token and DelegatedDAO contracts

Step 0b: Seed Investors and DAO with Tokens

Step 1: (Un)Delegate Votes

Step 2: Create Proposals

Step 3: Vote on Proposals

Step 4a: Finalize as Passed: Quorum Reached - distribute funds

Step 4b: Finalize as Failed: Proposal Expired - no funds distributed

## Local Testing
To test the Crowdsale locally, run the following:
```shell
npx hardhat node

npx hardhat --network localhost scripts/1_deploy.js

npx hardhat --network localhost scripts/2_seed.js

npm run start
```

![Delegated DAO](./public/delegated-dao.png)
