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
    // Set votingPeriodHours to 72 (3 days)
    const DelegatedDAO = await ethers.getContractFactory('DelegatedDAO')
    delegatedDAO = await DelegatedDAO.deploy(token.address, 500001, 72)

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
      transaction = await token.connect(investor1).approve(delegatedDAO.address, 100000)
      await transaction.wait()
      transaction = await delegatedDAO.connect(investor1).delegate(investorDelegate1.address)
      await transaction.wait()

      transaction = await token.connect(investor2).approve(delegatedDAO.address, 100000)
      await transaction.wait()
      transaction = await delegatedDAO.connect(investor2).delegate(investorDelegate1.address)
      await transaction.wait()

      transaction = await token.connect(investor3).approve(delegatedDAO.address, 100000)
      await transaction.wait()
      transaction = await delegatedDAO.connect(investor3).delegate(investorDelegate1.address)
      await transaction.wait()

      // 2 investor delegates to investorDelegate2
      transaction = await token.connect(investor4).approve(delegatedDAO.address, 100000)
      await transaction.wait()
      transaction = await delegatedDAO.connect(investor4).delegate(investorDelegate2.address)
      await transaction.wait()

      transaction = await token.connect(investor5).approve(delegatedDAO.address, 100000)
      await transaction.wait()
      transaction = await delegatedDAO.connect(investor5).delegate(investorDelegate2.address)
      await transaction.wait()

      // 1 investor delegate to investorDelegate3
      transaction = await token.connect(investor6).approve(delegatedDAO.address, 100000)
      await transaction.wait()
      transaction = await delegatedDAO.connect(investor6).delegate(investorDelegate3.address)
      result = await transaction.wait()

      // 0 investors delgate to investorDelegate4 - no transaction needed
    })

    describe('Success', () => {
      it('updates totalTokensDelegated', async () => {
        expect(await delegatedDAO.totalTokensDelegated()).to.equal(600000)
      })

      it('updates delegatorBalance', async () => {
        expect(await delegatedDAO.delegatorBalance(investor1.address)).to.equal(100000)
        expect(await delegatedDAO.delegatorBalance(investor2.address)).to.equal(100000)
        expect(await delegatedDAO.delegatorBalance(investor3.address)).to.equal(100000)
        expect(await delegatedDAO.delegatorBalance(investor4.address)).to.equal(100000)
        expect(await delegatedDAO.delegatorBalance(investor5.address)).to.equal(100000)
      })

      it('updates delegateeDelegators', async () => {
        expect(await delegatedDAO.delegateeDelegators(investorDelegate1.address, 1)).to.equal(investor1.address)

        expect(await delegatedDAO.delegateeDelegators(investorDelegate1.address, 2)).to.equal(investor2.address)

        expect(await delegatedDAO.delegateeDelegators(investorDelegate1.address, 3)).to.equal(investor3.address)

        expect(await delegatedDAO.delegateeDelegators(investorDelegate2.address, 1)).to.equal(investor4.address)

        expect(await delegatedDAO.delegateeDelegators(investorDelegate2.address, 2)).to.equal(investor5.address)

        expect(await delegatedDAO.delegateeDelegators(investorDelegate3.address, 1)).to.equal(investor6.address)
      })

      it('updates delegateeDelegatorIndex', async () => {
        expect(await delegatedDAO.delegateeDelegatorIndex(investorDelegate1.address, investor1.address)).to.equal(1)

        expect(await delegatedDAO.delegateeDelegatorIndex(investorDelegate1.address, investor2.address)).to.equal(2)

        expect(await delegatedDAO.delegateeDelegatorIndex(investorDelegate1.address, investor3.address)).to.equal(3)

        expect(await delegatedDAO.delegateeDelegatorIndex(investorDelegate2.address, investor4.address)).to.equal(1)

        expect(await delegatedDAO.delegateeDelegatorIndex(investorDelegate2.address, investor5.address)).to.equal(2)

        expect(await delegatedDAO.delegateeDelegatorIndex(investorDelegate3.address, investor6.address)).to.equal(1)
      })

      it('updates delegateeDelegatorCount', async () => {
        expect(await delegatedDAO.delegateeDelegatorCount(investorDelegate1.address)).to.equal(3)

        expect(await delegatedDAO.delegateeDelegatorCount(investorDelegate2.address)).to.equal(2)

        expect(await delegatedDAO.delegateeDelegatorCount(investorDelegate3.address)).to.equal(1)
      })

      it('updates delegateeVotesReceived', async () => {
        expect(await delegatedDAO.delegateeVotesReceived(investorDelegate1.address)).to.equal(300000)

        expect(await delegatedDAO.delegateeVotesReceived(investorDelegate2.address)).to.equal(200000)

        expect(await delegatedDAO.delegateeVotesReceived(investorDelegate3.address)).to.equal(100000)
      })

      it('updates delgatee votes on live proposals', async () => {
        transaction = await delegatedDAO
          .connect(investor1)
          .createProposal('Proposal 1', 'Description 1', 10000, recipient.address)
        await transaction.wait()

        // expect no votes on proposal
        let proposal = await delegatedDAO.proposals(1)
        expect(proposal.votes).to.equal(0)

        // investorDelegate3 votes on proposal
        transaction = await delegatedDAO.connect(investorDelegate3).upVote(1)
        await transaction.wait()

        // expect investorDelegate3 votes to be counted w/ delegation
        proposal = await delegatedDAO.proposals(1)
        expect(proposal.votes).to.equal(200000)

        // investor1 undelegates from investorDelegate1 and delegates to investorDelegate3
        await delegatedDAO.connect(investor1).undelegate()
        transaction = await token.connect(investor1).approve(delegatedDAO.address, 100000)
        await transaction.wait()
        transaction = await delegatedDAO.connect(investor1).delegate(investorDelegate3.address)

        // expect investorDelegate3 votes to be counted w/ delegation from investor1 and investor6
        proposal = await delegatedDAO.proposals(1)
        expect(proposal.votes).to.equal(300000)
      })

      it('emits a delegate event', async () => {
        // fetch block of transaction
        let block = await ethers.provider.getBlock(result.blockNumber)

        // test the block's timestamp
        expect(block.timestamp).to.be.at.least(Date.now()/1000 - 60) // allow 60 seconds for potential clock skew

        // extract event from the receipt
        let event = result.events?.filter((x) => {return x.event == 'Delegate'})[0]

        // test the event
        /* eslint-disable no-unused-expressions */
        expect(event).to.not.be.undefined
        expect(event.args).to.not.be.undefined
        expect(event.args.delegatee).to.equal(investorDelegate3.address)
        expect(event.args.delegator).to.equal(investor6.address)
        expect(event.args.amount.toNumber()).to.equal(100000) // adjust to your expected amount
        expect(event.args.timestamp.toNumber()).to.equal(block.timestamp)
      })
    })

    describe('Failure', () => {
      it('rejects non-investor', async () => {
        await expect(delegatedDAO.connect(user).delegate(investorDelegate1.address)).to.be.reverted
      })

      it('rejects delegating to self', async () => {
        await expect(delegatedDAO.connect(investorDelegate4).delegate(investorDelegate4.address)).to.be.reverted
      })

      it('rejects delegating to 0x0 address', async () => {
        await expect(delegatedDAO.connect(investorDelegate4).delegate(ethers.constants.AddressZero)).to.be.reverted
      })

      it('rejects delegating to non-investor', async () => {
        await expect(delegatedDAO.connect(investorDelegate4).delegate(user.address)).to.be.reverted
      })

      it('rejects delegating to delegator (chained delegation)',async () => {
        await expect(delegatedDAO.connect(investorDelegate4).delegate(investor1.address)).to.be.reverted
      })

      it('rejects delegating as delegatee (chained delegation)', async () => {
        await expect(delegatedDAO.connect(investorDelegate1).delegate(investorDelegate4.address)).to.be.reverted
      })

      it('rejects double delegation', async () => {
        await expect(delegatedDAO.connect(investor1).delegate(investorDelegate2.address)).to.be.reverted
      })
    })

  })

  describe('Undelegate Voting', () => {
    let transaction, result

    beforeEach(async () => {
      // investor1 delegates to investorDelegate1
      transaction = await token.connect(investor1).approve(delegatedDAO.address, 100000)
      await transaction.wait()
      transaction = await delegatedDAO.connect(investor1).delegate(investorDelegate1.address)
      await transaction.wait()

      // investor1 creates proposal
      transaction = await delegatedDAO
        .connect(investor1)
        .createProposal('Proposal 1', 'Description 1', 10000, recipient.address)
      await transaction.wait()

      // investorDelegate1 votes on proposal
      transaction = await delegatedDAO
        .connect(investorDelegate1)
        .upVote(1)
      await transaction.wait()

      // investor1 undelegates
      transaction = await delegatedDAO.connect(investor1).undelegate()
      result = await transaction.wait()

      // investor1 delegates to investorDelegate1 a second time
      transaction = await token.connect(investor1).approve(delegatedDAO.address, 100000)
      await transaction.wait()
      transaction = await delegatedDAO.connect(investor1).delegate(investorDelegate1.address)
      result = transaction.wait()

      // investor1 undelegates a second time
      transaction = await delegatedDAO.connect(investor1).undelegate()
      result = await transaction.wait()
    })

    describe('Success', () => {
      it('updates totalTokensDelegated', async () => {
        expect(await delegatedDAO.totalTokensDelegated()).to.equal(0)
      })

      it('updates delegatorBalance', async () => {
        expect(await delegatedDAO.delegatorBalance(investor1.address)).to.equal(0)
      })

      it('removes delegator votes from delegateeVotesReceived', async () => {
        expect(await delegatedDAO.delegateeVotesReceived(investorDelegate1.address)).to.equal(0)
      })

      it('removes delegator votes from live proposals voted on by removed delegatee', async () => {
        const proposal = await delegatedDAO.proposals(1)
        expect(proposal.votes).to.equal(100000)
      })

      it('updates delegateeDelegators', async () => {
        expect(await delegatedDAO.delegateeDelegators(investorDelegate1.address, 1)).to.equal(ethers.constants.AddressZero)
      })

      it('removes delegator from delegateeDelegatorIndex mapping', async () => {
        expect(await delegatedDAO.delegateeDelegatorIndex(investorDelegate1.address, investor1.address)).to.equal(0)
      })

      it('updates delegateeDelegatorCount', async () => {
        expect(await delegatedDAO.delegateeDelegatorCount(investorDelegate1.address)).to.equal(0)
      })

      it('updates delegatorDelegatee', async () => {
        expect(await delegatedDAO.delegatorDelegatee(investor1.address)).to.equal(ethers.constants.AddressZero)
      })

      it('emits an undelegate event', async () => {
        // fetch block of transaction
        let block = await ethers.provider.getBlock(result.blockNumber)

        // test the block's timestamp
        expect(block.timestamp).to.be.at.least(Date.now()/1000 - 60) // allow 60 seconds for potential clock skew

        // extract event from the receipt
        let event = result.events?.filter((x) => {return x.event == 'Undelegate'})[0]

        // test the event
        /* eslint-disable no-unused-expressions */
        expect(event).to.not.be.undefined
        expect(event.args).to.not.be.undefined
        expect(event.args.delegatee).to.equal(investorDelegate1.address)
        expect(event.args.delegator).to.equal(investor1.address)
        expect(event.args.amount.toNumber()).to.equal(100000) // adjust to your expected amount
        expect(event.args.timestamp.toNumber()).to.equal(block.timestamp)
      })

      it('handles multiple delegators', async () => {
        // delegate investor2 to investorDelegate2
        transaction = await token.connect(investor2).approve(delegatedDAO.address, 100000)
        await transaction.wait()
        transaction = await delegatedDAO.connect(investor2).delegate(investorDelegate2.address)
        await transaction.wait()

        // delegate investor3 to investorDelegate2
        transaction = await token.connect(investor3).approve(delegatedDAO.address, 100000)
        await transaction.wait()
        transaction = await delegatedDAO.connect(investor3).delegate(investorDelegate2.address)
        await transaction.wait()

        // undelegate investor2 from investorDelegate2
        transaction = await delegatedDAO.connect(investor2).undelegate()
        await transaction.wait()

        // check that investor2 updates delegatorDelegatee to 0x0 address
        expect(await delegatedDAO.delegatorDelegatee(investor2.address)).to.equal(ethers.constants.AddressZero)

        // check that investorDelegate2 still has investor3 as delegator
        expect(await delegatedDAO.delegateeDelegators(investorDelegate2.address, 1)).to.equal(investor3.address)

        // check investorDelegate2 has correct delegator count
        expect(await delegatedDAO.delegateeDelegatorCount(investorDelegate2.address)).to.equal(1)

        // check investor3 has correct delegator index
        expect(await delegatedDAO.delegateeDelegatorIndex(investorDelegate2.address, investor3.address)).to.equal(1)

        // check that investorDelegate2 has correct voting power
        expect(await delegatedDAO.delegateeVotesReceived(investorDelegate2.address)).to.equal(100000)
      })

      it('should allow the delegator to vote independently after undelegation', async () => {
        await delegatedDAO.connect(investor1).upVote(1)
        const proposal = await delegatedDAO.proposals(1)
        expect(proposal.votes).to.equal(200000) // 100000 votes from investorDelegatee1 (in beforeEach) and 100000 from undelegated investor1
      })

      it('should allow the delegator to delegate to a new delegatee after undelegation', async () => {
        transaction = await token.connect(investor1).approve(delegatedDAO.address, 100000)
        await transaction.wait()
        await delegatedDAO.connect(investor1).delegate(investorDelegate2.address)
        const newDelegateeVotes = await delegatedDAO.delegateeVotesReceived(investorDelegate2.address)
        expect(newDelegateeVotes).to.equal(100000) // The votes from investor1 should be added to investorDelegate2
      })
    })

    describe('Failure', () => {
      it('rejects non-investor', async () => {
        await expect(delegatedDAO.connect(user).undelegate()).to.be.reverted
      })

      it('rejects investors who have not delegated', async () => {
        await expect(delegatedDAO.connect(investorDelegate4).undelegate()).to.be.reverted
      })

      it('rejects investors who have already undelegated', async () => {
        transaction = await token.connect(investor2).approve(delegatedDAO.address, 100000)
        await transaction.wait()
        await delegatedDAO.connect(investor2).delegate(investorDelegate2.address);
        await delegatedDAO.connect(investor2).undelegate();
        await expect(delegatedDAO.connect(investor2).undelegate()).to.be.reverted;
      })
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

      it('records the votes cast by the voter and all voters who delegated', async () => {
        // 2 investor delegates to investorDelegate2
        transaction = await token.connect(investor4).approve(delegatedDAO.address, 100000)
        await transaction.wait()
        transaction = await delegatedDAO.connect(investor4).delegate(investorDelegate2.address)
        await transaction.wait()

        transaction = await token.connect(investor5).approve(delegatedDAO.address, 100000)
        await transaction.wait()
        transaction = await delegatedDAO.connect(investor5).delegate(investorDelegate2.address)
        await transaction.wait()

        // investorDelegate2 upvotes proposal 1
        transaction = await delegatedDAO.connect(investorDelegate2).upVote(1)

        // updates votesCast for investor4, investor5, and investorDelegate2
        expect(await delegatedDAO.votesCast(investor4.address, 1)).to.equal(100000)
        expect(await delegatedDAO.votesCast(investor5.address, 1)).to.equal(100000)
        expect(await delegatedDAO.votesCast(investorDelegate2.address, 1)).to.equal(300000)
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

      it('rejects voting if investor has delegated votes', async () => {
        // investor1 delegates to investorDelegate1
        transaction = await token.connect(investor1).approve(delegatedDAO.address, 100000)
        await transaction.wait()
        transaction = await delegatedDAO.connect(investor1).delegate(investorDelegate1.address)
        await transaction.wait()

        // investor1 creates proposal
        transaction = await delegatedDAO
          .connect(investor1)
          .createProposal('Proposal 1', 'Description 1', 10000, recipient.address)
        await transaction.wait()

        // investorDelegate1 votes on proposal
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
        expect(await delegatedDAO.votesCast(investor1.address, 1)).to.equal(100000)
        expect(await delegatedDAO.votesCast(investor2.address, 1)).to.equal(-100000)
      })

      it('records the votes cast by the voter and all voters who delegated', async () => {
        // investor4 and investor5 delegate to investorDelegate2
        transaction = await token.connect(investor4).approve(delegatedDAO.address, 100000)
        await transaction.wait()
        transaction = await delegatedDAO.connect(investor4).delegate(investorDelegate2.address)
        await transaction.wait()

        transaction = await token.connect(investor5).approve(delegatedDAO.address, 100000)
        await transaction.wait()
        transaction = await delegatedDAO.connect(investor5).delegate(investorDelegate2.address)
        await transaction.wait()

        // investorDelegate2 downvotes proposal 1
        transaction = await delegatedDAO.connect(investorDelegate2).downVote(1)

        expect(await delegatedDAO.votesCast(investor4.address, 1)).to.equal(-100000)
        expect(await delegatedDAO.votesCast(investor5.address, 1)).to.equal(-100000)
        expect(await delegatedDAO.votesCast(investorDelegate2.address, 1)).to.equal(-300000)
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

      it('rejects voting if investor delegated votes', async () => {
        // investor1 delegates to investorDelegate1
        transaction = await token.connect(investor1).approve(delegatedDAO.address, 100000)
        await transaction.wait()
        transaction = await delegatedDAO.connect(investor1).delegate(investorDelegate1.address)
        await transaction.wait()

        // investor1 creates proposal
        transaction = await delegatedDAO
          .connect(investor1)
          .createProposal('Proposal 1', 'Description 1', 10000, recipient.address)
        await transaction.wait()

        // investorDelegate1 votes on proposal
        await expect(delegatedDAO.connect(investor1).upVote(1)).to.be.reverted
      })
    })

  })

  describe('Governance', () => {
    let transaction, result

    describe('Success', () => {
      beforeEach(async () => {
        // Create Proposal 1
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

        transaction = await delegatedDAO.connect(investor1).finalizeProposal(1)
        result = await transaction.wait()
      })

      it('transfers funds to the recipient', async () => {
        expect(await token.balanceOf(recipient.address)).to.equal(50000)
      })

      it('updates the proposal to finalized', async () => {
        const proposal = await delegatedDAO.proposals(1)
        // 0 = Pending, 1 = Finalized, 2 = Rejected
        expect(proposal.status).to.equal(1)
      })

      it('emits a Finalize event that Passes', async () => {
        const event = result.events.filter((x) => {return x.event === "Finalize"});

        expect(event[0].args.id).to.equal(1)
        expect(event[0].args.recipient).to.equal(recipient.address)
        // 0 = Pending, 1 = Finalized, 2 = Rejected
        expect(event[0].args.status).to.equal(1)
      })

      it('emits a Finalize event that Fails', async () => {
        // Create Proposal 2
        transaction = await delegatedDAO
          .connect(investor1)
          .createProposal('Proposal 2', 'Description 2', 50000, recipient.address)
        result = await transaction.wait()

        // Up Vote
        transaction = await delegatedDAO.connect(investor1).upVote(2)
        result = await transaction.wait()

        transaction = await delegatedDAO.connect(investor2).upVote(2)
        result = await transaction.wait()

        transaction = await delegatedDAO.connect(investor3).upVote(2)
        result = await transaction.wait()

        transaction = await delegatedDAO.connect(investor4).upVote(2)
        result = await transaction.wait()

        transaction = await delegatedDAO.connect(investor5).upVote(2)
        result = await transaction.wait()

        transaction = await delegatedDAO.connect(investor6).upVote(2)
        result = await transaction.wait()

        // Move time forward 7 days
        await ethers.provider.send('evm_increaseTime', [7 * 24 * 60 * 60])
        await ethers.provider.send('evm_mine')  // Mine a new block

        // Finalize proposal
        transaction = await delegatedDAO.connect(investor1).finalizeProposal(2)
        result = await transaction.wait()

        // Finalize event should update proposal status to Rejected
        await expect(transaction).to.emit(delegatedDAO, 'Finalize')
          .withArgs(2, recipient.address, 2)
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

      it('rejects finalization if already finalized', async () => {
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
