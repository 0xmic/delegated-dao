const { expect } = require('chai')
const { ethers } = require('hardhat')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('Delegated DAO', () => {
  let token, delegatedDAO
  let accounts, deployer,
      investor1, investor2, investor3, investor4, investor5, investor6,
      investorDelegate1, investorDelegate2, investorDelegate3, investorDelegate4

  beforeEach(async () => {
    let transaction

    // Set up accounts
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    investor1 = accounts[1]
    investor2 = accounts[2]
    investor3 = accounts[3]
    investor4 = accounts[4]
    investor5 = accounts[5]
    investor6 = accounts[6]
    investorDelegate1 = accounts[7]
    investorDelegate2 = accounts[8]
    investorDelegate3 = accounts[9]
    investorDelegate4 = accounts[10]

    // Deploy token
    const Token = await ethers.getContractFactory('Token')
    token = await Token.deploy('2000000')

    // Send tokens to investors - 50% (1M) of total supply, each investor gets 100k tokens
    transaction = await token.connect(deployer).transfer(investor1.address, 100000)
    await transaction.wait()

    transaction = await token.connect(deployer).transfer(investor2.address, 100000)
    await transaction.wait()

    transaction = await token.connect(deployer).transfer(investor3.address, 100000)
    await transaction.wait()

    transaction = await token.connect(deployer).transfer(investor4.address, 100000)
    await transaction.wait()

    transaction = await token.connect(deployer).transfer(investor5.address, 100000)
    await transaction.wait()

    transaction = await token.connect(deployer).transfer(investor6.address, 100000)
    await transaction.wait()

    transaction = await token.connect(deployer).transfer(investorDelegate1.address, 100000)
    await transaction.wait()

    transaction = await token.connect(deployer).transfer(investorDelegate2.address, 100000)
    await transaction.wait()

    transaction = await token.connect(deployer).transfer(investorDelegate3.address, 100000)
    await transaction.wait()

    transaction = await token.connect(deployer).transfer(investorDelegate4.address, 100000)
    await transaction.wait()

    // Deploy DAO
    // Set quorum to > 25% of total token supply (500k tokens)
    const DelegatedDAO = await ethers.getContractFactory('DelegatedDAO')
    delegatedDAO = await DelegatedDAO.deploy(token.address, 500001)

    // Send remaining tokens to DAO treasury - 50% (1M) of total supply
    transaction = await token.connect(deployer).transfer(delegatedDAO.address, 1000000)
  })

  describe('Deployment', () => {
    it('sends Crypto Token (CT) to the DAO treasury', async () => {
      expect(await token.balanceOf(delegatedDAO.address)).to.equal(1000000)
    })

    it('has correct token address', async () => {
      expect(await delegatedDAO.token()).to.equal(token.address)
    })

    it('returns quorum', async () => {
      expect(await delegatedDAO.quorum()).to.equal(500001)
    })
  })

})
