const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Delegated DAO', () => {
  let token, delegatedDAO
  let accounts, deployer,
      investor1, investor2, investor3, investor4, investor5, investor6,
      investorDelegate1, investorDelegate2, investorDelegate3, investorDelegate4,
      recipient, user

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
    recipient = accounts[11]
    user = accounts[12]

    // Deploy token
    const Token = await ethers.getContractFactory('Token')
    token = await Token.deploy(2000000)

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

  describe('Proposal Creation', () => {
    let transaction, result

    describe('Success', () => {
      beforeEach(async () => {
        transaction = await delegatedDAO
          .connect(investor1)
          .createProposal('Proposal 1', 'Description 1', 10000, recipient.address)
        result = await transaction.wait()
      })

      it('updates proposal count', async () => {
        expect(await delegatedDAO.proposalCount()).to.equal(1)
      })

      it('updates proposal mapping', async () => {
        const proposal = await delegatedDAO.proposals(1)

        expect(proposal.id).to.equal(1)
        expect(proposal.title).to.equal('Proposal 1')
        expect(proposal.description).to.equal('Description 1')
        expect(proposal.amount).to.equal(10000)
        expect(proposal.recipient).to.equal(recipient.address)
      })
    })

    describe('Failure', () => {
      it('rejects invalid amount - not enough funds in DAO', async () => {
        await expect(delegatedDAO.connect(investor1).createProposal(
          'Proposal 1', 'Description 1', 1000001, recipient.address
        )).to.be.reverted
      })

      it('rejects non-investor', async () => {
        await expect(delegatedDAO.connect(user).createProposal(
          'Proposal 1', 'Description 1', 10000, recipient.address
        )).to.be.reverted
      })
    })

  })

  describe('Delegate Voting', () => {
    // TODO
  })

  describe('Undelegate Voting', () => {
    // TODO
  })

  describe('Up Voting', () => {
    let transaction, result

    beforeEach(async () => {
      transaction = await delegatedDAO
        .connect(investor1)
        .createProposal('Proposal 1', 'Description 1', 50000, recipient.address)
      result = await transaction.wait()
    })

    describe('Success', async () => {
      beforeEach(async () => {
        transaction = await delegatedDAO.connect(investor1).upVote(1)
        result = await transaction.wait()
      })

      it('updates vote count', async () => {
        const proposal = await delegatedDAO.proposals(1)
        expect(proposal.votes).to.equal(100000)
      })

      it('updates voter mapping', async () => {
        expect(await delegatedDAO.votes(investor1.address, 1)).to.equal(true)
      })

      it('emits an UpVote event', async () => {
        await expect(transaction).to.emit(delegatedDAO, 'UpVote').withArgs(1, investor1.address)
      })
    })

    describe('Failure', () => {
      it('rejects non-investor', async () => {
        await expect(delegatedDAO.connect(user).upVote(1)).to.be.reverted
      })

      it('rejects double voting', async () => {
        transaction = await delegatedDAO.connect(investor1).upVote(1)
        await transaction.wait()

        await expect(delegatedDAO.connect(investor1).upVote(1)).to.be.reverted
      })
    })
  })

  describe('Down Voting', () => {
    let transaction, result

    beforeEach(async () => {
      transaction = await delegatedDAO
        .connect(investor1)
        .createProposal('Proposal 1', 'Description 1', 50000, recipient.address)
      result = await transaction.wait()
    })

    describe('Success', () => {
      beforeEach(async () => {
        transaction = await delegatedDAO.connect(investor1).upVote(1)
        result = await transaction.wait()

        transaction = await delegatedDAO.connect(investor2).downVote(1)
        result = await transaction.wait()
      })

      it('updates vote count', async () => {
        const proposal = await delegatedDAO.proposals(1)
        expect(proposal.votes).to.equal(0)
      })

      it('updates voter mapping', async () => {
        expect(await delegatedDAO.votes(investor1.address, 1)).to.equal(true)
        expect(await delegatedDAO.votes(investor2.address, 1)).to.equal(true)
      })

      it('emits a DownVote event', async () => {
        await expect(transaction).to.emit(delegatedDAO, 'DownVote').withArgs(1, investor2.address)
      })
    })

    describe('Failure', () => {
      it('rejects non-investor', async () => {
        await expect(delegatedDAO.connect(user).downVote(1)).to.be.reverted
      })

      it('rejects double voting', async () => {
        transaction = await delegatedDAO.connect(investor1).downVote(1)
        await transaction.wait()

        await expect(delegatedDAO.connect(investor1).downVote(1)).to.be.reverted
      })
    })
  })

  describe('Governance', () => {
    // TODO
  })

})
