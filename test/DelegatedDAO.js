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
    let transaction, result

    beforeEach(async () => {
      // 3 investors delegate to investorDelegate1
      transaction = await delegatedDAO.connect(investor1).delegate(investorDelegate1.address)
      result = transaction.wait()

      transaction = await delegatedDAO.connect(investor2).delegate(investorDelegate1.address)
      result = transaction.wait()

      transaction = await delegatedDAO.connect(investor3).delegate(investorDelegate1.address)
      result = transaction.wait()

      // 1 investor delegates to investorDelegate2
      transaction = await delegatedDAO.connect(investor4).delegate(investorDelegate2.address)
      result = transaction.wait()

      // 2 investors delegate to investorDelegate3
      transaction = await delegatedDAO.connect(investor5).delegate(investorDelegate3.address)
      result = transaction.wait()

      transaction = await delegatedDAO.connect(investor6).delegate(investorDelegate3.address)
      result = transaction.wait()

      // 0 investors delgate to investorDelegate4
      // no transaction needed
    })

    describe('Success', () => {
      it('delegates correctly', () => {

      })

      // it updates delegateeDelegators
      // it updates delegateeDelegatorIndex
      // it updates delegateeDelegatorCount
      // it updates delegateeDelegatorCount
      // it updates delegateeVotesReceived
      // it updates deelgatee's votes on live proposals
      // it emits a delegate event
    })

    describe('Failure', () => {
      it('fails correctly', () => {

      })

      // it rejects non-investor
      // it rejects delegating to self
      // it rejects delegating to 0x0 address
      // it rejects delegating to non-investor
      // it rejects delegating as a delegatee (chained delegation)
    })
  })

  describe('Undelegate Voting', () => {
    let transaction, result

    describe('Success', () => {
      it('undelegates correctly', () => {

      })

      // it rejects non-investor
      // it removes delegator's votes from delegateeVotesReceived
      // it removes delegator's votes from live proposals
      // it updates delegateeDelegators
      // it updates delegateeDelegatorIndex
      // it updates delegateeDelegatorCount
      // it updates delegatorDelegatee
      // it emits an undelegate event
    })

    describe('Failure', () => {
      it('fails correctly', () => {

      })

      // it rejects investors who have not delegated
    })
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
        expect(await delegatedDAO.votesCast(investor1.address, 1)).to.equal(100000)
      })

      // it records the votes cast by the voter and all voters who delegated

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

      // it rejects if investor has delegated vote
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
        expect(await delegatedDAO.votesCast(investor1.address, 1)).to.equal(100000)
        expect(await delegatedDAO.votesCast(investor2.address, 1)).to.equal(100000)
      })

      // it records the votes cast by the voter and all voters who delegated

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
    let transaction, result

    describe('Success', () => {
      beforeEach(async () => {
        // Create proposal
        transaction = await delegatedDAO
          .connect(investor1)
          .createProposal('Proposal 1', 'Description 1', 50000, recipient.address)
        result = await transaction.wait()

        // Up Vote
        transaction = await delegatedDAO.connect(investor1).upVote(1)
        result = await transaction.wait()

        transaction = await delegatedDAO.connect(investor2).upVote(1)
        result = await transaction.wait()

        transaction = await delegatedDAO.connect(investor3).upVote(1)
        result = await transaction.wait()

        transaction = await delegatedDAO.connect(investor4).upVote(1)
        result = await transaction.wait()

        transaction = await delegatedDAO.connect(investor5).upVote(1)
        result = await transaction.wait()

        transaction = await delegatedDAO.connect(investor6).upVote(1)
        result = await transaction.wait()

        // Finalize proposal
        transaction = await delegatedDAO.connect(investor1).finalizeProposal(1)
        result = await transaction.wait()
      })

      it('transfers funds to the recipient', async () => {
        expect(await token.balanceOf(recipient.address)).to.equal(50000)
      })

      it('updates the proposal to finalized', async () => {
        const proposal = await delegatedDAO.proposals(1)
        expect(proposal.finalized).to.equal(true)
      })

      it('emits a Finalize event', async () => {
        await expect(transaction).to.emit(delegatedDAO, 'Finalize').withArgs(1, recipient.address)
      })
    })

    describe('Failure', () => {
      beforeEach(async () => {
        // Create proposal
        transaction = await delegatedDAO
          .connect(investor1)
          .createProposal('Proposal 1', 'Description 1', 50000, recipient.address)
        result = await transaction.wait()

        // Up Vote
        transaction = await delegatedDAO.connect(investor1).upVote(1)
        result = await transaction.wait()

        transaction = await delegatedDAO.connect(investor2).upVote(1)
        result = await transaction.wait()

        transaction = await delegatedDAO.connect(investor3).upVote(1)
        result = await transaction.wait()
      })

      it('rejects finalization if not enough votes', async () => {
        await expect(delegatedDAO.connect(investor1).finalizeProposal(1)).to.be.reverted
      })

      it('rejects finalization from a non-investor', async () => {
        // Increase votes to pass quorum
        transaction = await delegatedDAO.connect(investor4).upVote(1)
        result = await transaction.wait()

        transaction = await delegatedDAO.connect(investor5).upVote(1)
        result = await transaction.wait()

        transaction = await delegatedDAO.connect(investor6).upVote(1)
        result = await transaction.wait()

        // Try to finalize as non-investor
        await expect(delegatedDAO.connect(user).finalizeProposal(1)).to.be.reverted
      })

      it('rejects proposal if already finalzied', async () => {
        // Increase votes to pass quorum
        transaction = await delegatedDAO.connect(investor4).upVote(1)
        result = await transaction.wait()

        transaction = await delegatedDAO.connect(investor5).upVote(1)
        result = await transaction.wait()

        transaction = await delegatedDAO.connect(investor6).upVote(1)
        result = await transaction.wait()

        // Finalize proposal
        transaction = await delegatedDAO.connect(investor1).finalizeProposal(1)
        result = await transaction.wait()

        // Try to finalize again
        await expect(delegatedDAO.connect(investor1).finalizeProposal(1)).to.be.reverted
      })
    })
  })

})
