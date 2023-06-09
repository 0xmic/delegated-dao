// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require('hardhat')

async function main() {
  const MAX_SUPPLY = 2000000
  const decimals = 18
  const quorum = 0.25
  const votingPeriodHours = 1

  // Deploy Token
  const Token = await hre.ethers.getContractFactory('Token')
  let token = await Token.deploy(hre.ethers.utils.parseUnits(MAX_SUPPLY.toString(), decimals));
  await token.deployed()

  console.log(`Token deployed to: ${token.address}`)
  console.log(`Token supply: ${(await token.totalSupply())}`)
  console.log(`Token decimals: ${(await token.decimals())}\n`)
  const [deployer] = await hre.ethers.getSigners()
  console.log(`Deployer balance: ${(await token.balanceOf(deployer.address))}\n`)

  // Deploy DelegatedDAO
  const DelegatedDAO = await hre.ethers.getContractFactory('DelegatedDAO')
  let delegatedDAO = await DelegatedDAO.deploy(token.address, hre.ethers.utils.parseUnits((quorum*MAX_SUPPLY).toString(), decimals), votingPeriodHours);
  await delegatedDAO.deployed()

  console.log(`DelegatedDAO deployed to: ${delegatedDAO.address}`)
  console.log(`DelegatedDAO quorum: ${(await delegatedDAO.quorum())}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
