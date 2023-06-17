// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require('hardhat')
const config = require('../src/config.json')

const tokens = (n) => {
  return hre.ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {

  console.log(`> Fetching accounts & network...\n`)

  // Fetch accounts
  const accounts = await hre.ethers.getSigners()
  const deployer = accounts[0]
  const investor1 = accounts[1]
  const investor2 = accounts[2]
  const investor3 = accounts[3]
  const investor4 = accounts[4]
  const investor5 = accounts[5]
  const investor6 = accounts[6]
  const investorDelegate1 = accounts[7]
  const investorDelegate2 = accounts[8]
  const investorDelegate3 = accounts[9]
  const investorDelegate4 = accounts[10]
  const recipient = accounts[11]
  const user = accounts[12]
  console.log(`Accounts fetched`)

  // Fetch Network
  const { chainId } = await hre.ethers.provider.getNetwork()
  console.log(`Network fetched: ${chainId}\n`)

  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Fetch token

  console.log(`> Fetching token...\n`)

  // Fetch Crypto Token
  const token = await hre.ethers.getContractAt('Token', config[chainId].token.address)
  console.log(`Token fetched: ${token.address}\n`)

  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Distribute Tokens to Investors
  // Total distributed to investor = 50% (1M) of total supply (2M), each investor gets 100k tokens
  //

  console.log(`> Distributing tokens to investors...\n`)

  let transaction

  // Send tokens to investor1
  transaction = await token.connect(deployer).transfer(investor1.address, tokens(100000))
  await transaction.wait()
  console.log(`Investor1 balance: ${(await token.balanceOf(investor1.address))}`)

  // Send tokens to investor2
  transaction = await token.connect(deployer).transfer(investor2.address, tokens(100000))
  await transaction.wait()
  console.log(`Investor2 balance: ${(await token.balanceOf(investor2.address))}`)

  // Send tokens to investor3
  transaction = await token.connect(deployer).transfer(investor3.address, tokens(100000))
  await transaction.wait()
  console.log(`Investor3 balance: ${(await token.balanceOf(investor3.address))}`)

  // Send tokens to investor4
  transaction = await token.connect(deployer).transfer(investor4.address, tokens(100000))
  await transaction.wait()
  console.log(`Investor4 balance: ${(await token.balanceOf(investor4.address))}`)

  // Send tokens to investor5
  transaction = await token.connect(deployer).transfer(investor5.address, tokens(100000))
  await transaction.wait()
  console.log(`Investor5 balance: ${(await token.balanceOf(investor5.address))}`)

  // Send tokens to investor6
  transaction = await token.connect(deployer).transfer(investor6.address, tokens(100000))
  await transaction.wait()
  console.log(`Investor6 balance: ${(await token.balanceOf(investor6.address))}`)

  // Send tokens to investorDelegate1
  transaction = await token.connect(deployer).transfer(investorDelegate1.address, tokens(100000))
  await transaction.wait()
  console.log(`InvestorDelegate1 balance: ${(await token.balanceOf(investorDelegate1.address))}`)

  // Send tokens to investorDelegate2
  transaction = await token.connect(deployer).transfer(investorDelegate2.address, tokens(100000))
  await transaction.wait()
  console.log(`InvestorDelegate2 balance: ${(await token.balanceOf(investorDelegate2.address))}`)

  // Send tokens to investorDelegate3
  transaction = await token.connect(deployer).transfer(investorDelegate3.address, tokens(100000))
  await transaction.wait()
  console.log(`InvestorDelegate3 balance: ${(await token.balanceOf(investorDelegate3.address))}`)

  // Send tokens to investorDelegate4
  transaction = await token.connect(deployer).transfer(investorDelegate4.address, tokens(100000))
  await transaction.wait()
  console.log(`InvestorDelegate4 balance: ${(await token.balanceOf(investorDelegate4.address))}\n`)

  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Distribute Remaining Tokens to DelegatedDAO
  // Total distributed to delegatedDAO = 50% (1M of 2M), tokens remaining after distribution to investors
  //

  console.log('> Fetching DelegatedDAO and transferring remaining tokens to DAO...\n')

  // Fetch DelegatedDAO
  const delegatedDAO = await hre.ethers.getContractAt('DelegatedDAO', config[chainId].delegatedDAO.address)
  console.log(`DelegatedDAO fetched: ${delegatedDAO.address}]`)

  // Send remaining tokens to DelegatedDAO
  transaction = await token.connect(deployer).transfer(delegatedDAO.address, tokens(1000000))
  await transaction.wait()
  console.log(`DelegatedDAO balance: ${(await token.balanceOf(delegatedDAO.address))}\n`)

  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Delegate Voting from investors1-6 to investorDelegates1-3
  //

  console.log('> Delegating voting power...\n')

  // 3 investors delegate to investorDelegate1
  console.log(`InvestorDelegate1 address: ${investorDelegate1.address}`)
  transaction = await token.connect(investor1).approve(delegatedDAO.address, tokens(100000))
  await transaction.wait()
  transaction = await delegatedDAO.connect(investor1).delegate(investorDelegate1.address)
  await transaction.wait()
  console.log(`Investor1 delegate: ${(await delegatedDAO.delegatorDelegatee(investor1.address))}`)

  transaction = await token.connect(investor2).approve(delegatedDAO.address, tokens(100000))
  await transaction.wait()
  transaction = await delegatedDAO.connect(investor2).delegate(investorDelegate1.address)
  await transaction.wait()
  console.log(`Investor2 delegate: ${(await delegatedDAO.delegatorDelegatee(investor2.address))}`)

  transaction = await token.connect(investor3).approve(delegatedDAO.address, tokens(100000))
  await transaction.wait()
  transaction = await delegatedDAO.connect(investor3).delegate(investorDelegate1.address)
  await transaction.wait()
  console.log(`Investor3 delegate: ${(await delegatedDAO.delegatorDelegatee(investor3.address))}\n`)

  // 2 investor delegates to investorDelegate2
  console.log(`InvestorDelegate2 address: ${investorDelegate2.address}`)
  transaction = await token.connect(investor4).approve(delegatedDAO.address, tokens(100000))
  await transaction.wait()
  transaction = await delegatedDAO.connect(investor4).delegate(investorDelegate2.address)
  await transaction.wait()
  console.log(`Investor4 delegate: ${(await delegatedDAO.delegatorDelegatee(investor4.address))}`)

  transaction = await token.connect(investor5).approve(delegatedDAO.address, tokens(100000))
  await transaction.wait()
  transaction = await delegatedDAO.connect(investor5).delegate(investorDelegate2.address)
  await transaction.wait()
  console.log(`Investor5 delegate: ${(await delegatedDAO.delegatorDelegatee(investor5.address))}\n`)

  // 1 investors delegate to investorDelegate3
  transaction = await token.connect(investor6).approve(delegatedDAO.address, tokens(100000))
  await transaction.wait()
  console.log(`InvestorDelegate3 address: ${investorDelegate3.address}`)
  transaction = await delegatedDAO.connect(investor6).delegate(investorDelegate3.address)
  await transaction.wait()
  console.log(`Investor6 delegate: ${(await delegatedDAO.delegatorDelegatee(investor6.address))}\n`)

  // 0 investors delgate to investorDelegate4 - no transaction needed

  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Create Proposals
  //

  console.log('> Creating proposals...\n')

  // Create Proposal 1
  transaction = await delegatedDAO
          .connect(investor1)
          .createProposal('Website', 'Develop Website', tokens(100000), recipient.address)
  await transaction.wait()
  console.log(`Proposal 1 created: ${(await delegatedDAO.proposals(1))}`)

  // Create Proposal 2
  transaction = await delegatedDAO
          .connect(investor1)
          .createProposal('Advisors', 'Legal & Compliance', tokens(100000), recipient.address)
  await transaction.wait()
  console.log(`Proposal 2 created: ${(await delegatedDAO.proposals(2))}`)

  // Create Proposal 3
  transaction = await delegatedDAO
          .connect(investor1)
          .createProposal('Liquidity Pool', 'Create Uniswap LP', tokens(100000), recipient.address)
  await transaction.wait()
  console.log(`Proposal 3 created: ${(await delegatedDAO.proposals(3))}`)

  // Create Proposal 4
  transaction = await delegatedDAO
          .connect(investor1)
          .createProposal('NFTs', 'Launch DAO NFTs', tokens(100000), recipient.address)
  await transaction.wait()
  console.log(`Proposal 4 created: ${(await delegatedDAO.proposals(4))}\n`)

  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Vote on Proposals
  //

  console.log('> Voting on proposals...\n')

  // investorDelegate1 votes on proposal1 with delegated voting power
  console.log(`InvestorDelegate1 votes on proposal 1...`)
  transaction = await delegatedDAO.connect(investorDelegate1).upVote(1)
  await transaction.wait()
  console.log(`Proposal 1 votes: ${(await delegatedDAO.proposals(1)).votes}\n`)

  // investorDelegate2 votes on proposal2 with delegated voting power
  console.log(`InvestorDelegate2 votes on proposal 2...`)
  transaction = await delegatedDAO.connect(investorDelegate2).upVote(2)
  await transaction.wait()
  console.log(`Proposal 2 votes: ${(await delegatedDAO.proposals(2)).votes}\n`)

  // investorDelegate3 votes on proposal3 with delegated voting power
  console.log(`InvestorDelegate3 votes on proposal 3...`)
  transaction = await delegatedDAO.connect(investorDelegate3).upVote(3)
  await transaction.wait()
  console.log(`Proposal 3 votes: ${(await delegatedDAO.proposals(3)).votes}\n`)

  // investorDelegate4 votes on proposal4 without any delegated voting power
  console.log(`InvestorDelegate4 votes on proposal 4...`)
  transaction = await delegatedDAO.connect(investorDelegate4).upVote(4)
  await transaction.wait()
  console.log(`Proposal 4 votes: ${(await delegatedDAO.proposals(4)).votes}\n`)

  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Vote on and finalize Proposal 1
  //

  console.log('> Voting on and finalizing proposal 1...\n')

  // investorDelegate4 votes on proposal1
  console.log(`InvestorDelegate4 votes on proposal 1...`)
  transaction = await delegatedDAO.connect(investorDelegate4).upVote(1)
  await transaction.wait()
  console.log(`Proposal 1 votes: ${(await delegatedDAO.proposals(1)).votes}\n`)

  // investor1 finalizes proposal1
  console.log(`Investor1 finalizes proposal 1...`)
  transaction = await delegatedDAO.connect(investor1).finalizeProposal(1)
  await transaction.wait()
  console.log(`Proposal 1 finalized and passed (0 = Active, 1 = Passed, 2 = Failed): ${(await delegatedDAO.proposals(1)).status}\n`)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
