# Crypto Token (CT) DAO with Delegated Voting
This project demonstrates a full stack DAO project governed by an ERC-20 token. The DAO contract manages proposals that token holders can vote on to distribute tokens held by the DAO treasury to proposal recipients. The DAO contract allows for token holders to delegate their votes to other DAO members. The front-end allows users to interact with the DAO contract to submit new proposals, delegate votes, vote on proposals, and finalize proposals. Test files and scripts for deployment are included.

## Local Testing
To test the Crowdsale locally, run the following:
```shell
npx hardhat node

npx hardhat --network localhost scripts/1_deploy.js

npx hardhat --network localhost scripts/2_seed.js

npm run start
```