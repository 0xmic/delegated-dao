//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import './Token.sol';

/* @title DAO contract
 * @dev Implements voting mechanism for DAO with delegated voting
 */
contract DelegatedDAO {
    address owner;
    Token public token;
    uint256 public quorum;
    uint256 public totalTokensDelegated;
    uint256 public votingPeriodHours;

    enum ProposalStatus { Active, Passed, Failed }

    /* @notice Structure for proposals */
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 amount;
        address payable recipient;
        int256 votes;
        ProposalStatus status;
        uint256 timestamp;
    }

    uint256 public proposalCount;

    /* @notice proposal ID to Proposal */
    mapping(uint256 => Proposal) public proposals;

    /* @notice Investor address to proposal ID to vote weight cast on proposal */
    mapping(address => mapping(uint256 => int256)) public votesCast;

    /* @notice Delegator address to delegatee address */
    mapping(address => address) public delegatorDelegatee;

    /* @notice Delegator address to delegator balance */
    mapping(address => uint256) public delegatorBalance;

    /* @notice Delegatee address to delegator index to delegator address */
    mapping(address => mapping(uint256 => address)) public delegateeDelegators;

    /* @notice Delegatee address to delegator count */
    mapping(address => uint256) public delegateeDelegatorCount;

    /* @notice Delegatee address to delegator address to delegator index */
    mapping(address => mapping(address => uint256)) public delegateeDelegatorIndex;

    /* @notice Delegatee address to voting power received from delegators */
    mapping(address => uint256) public delegateeVotesReceived;

    event Propose(uint256 id, uint256 amount, address recipient,address creator, string description);
    event Delegate(address indexed delegator, address indexed delegatee, uint256 amount, uint256 timestamp);
    event Undelegate(address indexed delegator, address indexed delegatee, uint256 amount, uint256 timestamp);
    event UpVote(uint256 id, address investor);
    event DownVote(uint256 id, address investor);
    event Finalize(uint256 id, address recipient, ProposalStatus status);

    /* @notice Constructor for creating the DAO
     * @param _token The token used for the DAO
     * @param _quorum The minimum number of votes required for a proposal to pass
     */
    constructor(Token _token, uint256 _quorum, uint256 _votingPeriodHours) {
        owner = msg.sender;
        token = _token;
        quorum = _quorum;
        votingPeriodHours = _votingPeriodHours;
    }

    /* @notice Modifier to ensure the function caller is a token holder */
    modifier onlyInvestor() {
        require(
            token.balanceOf(msg.sender) > 0 ||
            delegatorBalance[msg.sender] > 0,
            "Must be token holder");
        _;
    }

    /* @notice Create a new proposal
     * @param _title The title of the proposal
     * @param _amount The amount of tokens requested
     * @param _recipient The address where funds will be sent if the proposal is approved
     * @param _description The details of the proposal
     */
    function createProposal(
        string memory _title,
        string memory _description,
        uint256 _amount,
        address payable _recipient
    ) external onlyInvestor {
        require(token.balanceOf(address(this)) - totalTokensDelegated >= _amount, "Not enough funds");

        proposalCount++;

        proposals[proposalCount] = Proposal(
            proposalCount,
            _title,
            _description,
            _amount,
            _recipient,
            0,
            ProposalStatus.Active,
            block.timestamp
        );

        emit Propose(
            proposalCount,
            _amount,
            _recipient,
            msg.sender,
            _description
        );
    }

    /* @notice Delegate a vote
     * @param _delegatee The address of the delegatee
     */
    function delegate(address _delegatee) external onlyInvestor {
        require(_delegatee != msg.sender, "Cannot delegate to self");
        require(_delegatee != address(0), "Cannot delegate to 0x0 address");
        require(token.balanceOf(_delegatee) > 0, "Cannot delegate to non-investor");
        require(delegatorDelegatee[_delegatee] == address(0), "Cannot delegate to delegator (chained delegation)");
        require(delegateeDelegatorCount[msg.sender] == 0, "Cannot delegate votes as delegatee (chained delegation)");
        require(delegatorDelegatee[msg.sender] == address(0), "Cannot double delegate");

        if(delegatorDelegatee[msg.sender] != address(0)) {
            undelegate();
        }

        // Transfer tokens from the delegator to the DAO contract
        uint256 amount = token.balanceOf(msg.sender);
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        delegatorBalance[msg.sender] = amount;

        // Delegate votes
        delegateeDelegatorCount[_delegatee]++;
        delegateeDelegators[_delegatee][delegateeDelegatorCount[_delegatee]] = msg.sender;
        delegateeDelegatorIndex[_delegatee][msg.sender] = delegateeDelegatorCount[_delegatee];
        delegateeVotesReceived[_delegatee] += amount;

        // Update Total Tokens Delegated
        totalTokensDelegated += amount;

        // Set delegatorDelegatee to delegatee
        delegatorDelegatee[msg.sender] = _delegatee;

        // Update delegatee's votes on live proposals
        for(uint256 i = 1; i <= proposalCount; i++) {
            // Check if the proposal is live, the delegatee has voted, and the delegator has not
            if (
                proposals[i].status == ProposalStatus.Active &&
                votesCast[_delegatee][i] > 0 &&
                votesCast[msg.sender][i] == 0
            ){
                proposals[i].votes += int(amount);
            }
        }

        emit Delegate(msg.sender, _delegatee, amount, block.timestamp);
    }

    /* @notice Undelegate a vote
     */
    function undelegate() public onlyInvestor {
        require(delegatorDelegatee[msg.sender] != address(0), "Have not delegated votes");

        // Transfer tokens from the DAO contract back to the delegator
        uint256 amount = delegatorBalance[msg.sender];
        require(token.transfer(msg.sender, amount), "Transfer failed");
        delegatorBalance[msg.sender] = 0;

        // Update Total Tokens Delegated
        totalTokensDelegated -= amount;

        // Remove delegator's votes from delegateeVotesReceived
        address removedDelegatee = delegatorDelegatee[msg.sender];
        delegateeVotesReceived[removedDelegatee] -= amount;

        // Remove delegator's votes from live proposals
        for(uint256 i = 1; i <= proposalCount; i++) {
            // Check if the proposal is live, and the delegator has voted
            if(proposals[i].status == ProposalStatus.Active && votesCast[msg.sender][i] > 0) {
                votesCast[removedDelegatee][i] -= int(amount);
                votesCast[msg.sender][i] -= int(amount);
                proposals[i].votes -= int(amount);
            }
        }

        // Remove delegator from delegateeDelegators
        uint256 indexToRemove = delegateeDelegatorIndex[removedDelegatee][msg.sender];
        if (indexToRemove != delegateeDelegatorCount[removedDelegatee]) {
            // Remove delegator from delegateeDelegators
            address lastDelegator = delegateeDelegators[removedDelegatee][delegateeDelegatorCount[removedDelegatee]];
            delegateeDelegators[removedDelegatee][indexToRemove] = lastDelegator;
            delegateeDelegatorIndex[removedDelegatee][lastDelegator] = indexToRemove;
        }

        // Reset the delegator index for the removed delegatee
        delegateeDelegatorIndex[removedDelegatee][msg.sender] = 0;

        // Reduce the delegator count for the delegatee
        delegateeDelegatorCount[removedDelegatee]--;

        // Remove the last delegator from delegateeDelegators
        delegateeDelegators[removedDelegatee][delegateeDelegatorCount[removedDelegatee]+1] = address(0);

        // Reset delegatorDelegatee to 0x0 address
        delete delegatorDelegatee[msg.sender];

        emit Undelegate(msg.sender, removedDelegatee, amount, block.timestamp);
    }

    /* @notice Upvote a proposal
     * @param _id The ID of the proposal
     */
    function upVote(uint256 _id) external onlyInvestor {
        require(votesCast[msg.sender][_id] == 0, "Already voted");
        require(delegatorDelegatee[msg.sender] == address(0), "Delegated vote");

        Proposal storage proposal = proposals[_id];

        uint256 voterBalance = token.balanceOf(msg.sender);
        uint256 voteWeight = voterBalance;

        // Add delegated votes if the voter is a delegatee
        if (delegateeDelegatorCount[msg.sender] > 0) {
            uint256 delegateeVoteWeight = delegateeVotesReceived[msg.sender];

            // Check if any of delegatee's delegators have voted on the proposal
            for (uint256 i = 1; i <= delegateeDelegatorCount[msg.sender]; i++) {
                address delegator = delegateeDelegators[msg.sender][i];

                // If a delegator has voted on the proposal, their vote shouldn't be counted twice
                if (votesCast[delegator][_id] != 0) {
                    delegateeVoteWeight -= delegatorBalance[delegator];
                }
            }
            voteWeight += delegateeVoteWeight;
        }

        proposal.votes += int(voteWeight);

        // Record votes cast by the voter and all delegators who delegated to this voter
        votesCast[msg.sender][_id] = int(voteWeight);
        for(uint256 i = 1; i <= delegateeDelegatorCount[msg.sender]; i++) {
            address delegator = delegateeDelegators[msg.sender][i];
            if (votesCast[delegator][_id] == 0) {
                votesCast[delegator][_id] = int(delegatorBalance[delegator]);
            }
        }

        emit UpVote(_id, msg.sender);
    }

    /* @notice Downvote a proposal
     * @param _id The ID of the proposal
     */
    function downVote(uint256 _id) external onlyInvestor {
        require(votesCast[msg.sender][_id] == 0, "Already voted");
        require(delegatorDelegatee[msg.sender] == address(0), "Delegated vote");

        Proposal storage proposal = proposals[_id];

        uint256 voterBalance = token.balanceOf(msg.sender);
        uint256 voteWeight = voterBalance;

        // Add delegated votes if the voter is a delegatee
        if (delegateeDelegatorCount[msg.sender] > 0) {
            uint256 delegateeVoteWeight = delegateeVotesReceived[msg.sender];

            // Check if any of delegatee's delegators have voted on the proposal
            for (uint256 i = 1; i <= delegateeDelegatorCount[msg.sender]; i++) {
                address delegator = delegateeDelegators[msg.sender][i];

                // If a delegator has voted on the proposal, their vote shouldn't be counted twice
                if (votesCast[delegator][_id] != 0) {
                    delegateeVoteWeight -= delegatorBalance[delegator];
                }
            }
            voteWeight += delegateeVoteWeight;
        }

        proposal.votes -= int(voteWeight);

        // Record votes cast by the voter and all delegators who delegated to this voter
        votesCast[msg.sender][_id] = -int(voteWeight);
        for(uint256 i = 1; i <= delegateeDelegatorCount[msg.sender]; i++) {
            address delegator = delegateeDelegators[msg.sender][i];
            if (votesCast[delegator][_id] == 0) {
                votesCast[delegator][_id] = -int(delegatorBalance[delegator]);
            }
        }

        emit DownVote(_id, msg.sender);
    }

    /* @notice Finalize a proposal
     * @param _id The ID of the proposal to finalize
     */
    function finalizeProposal(uint256 _id) external onlyInvestor {
        Proposal storage proposal = proposals[_id];

        require(proposal.status == ProposalStatus.Active, "Already finalized");

        // Check if the voting period has ended
        if(block.timestamp > proposal.timestamp + (votingPeriodHours * 60 * 60)) {
            proposal.status = ProposalStatus.Failed;
            emit Finalize(_id, proposal.recipient, ProposalStatus.Failed);
            return;
        }

        require(proposal.votes >= int(quorum) && proposal.votes > 0, "Not enough votes");
        require(token.balanceOf(address(this)) - totalTokensDelegated >= proposal.amount, "Not enough funds");

        require(token.transfer(proposal.recipient, proposal.amount), "Transfer failed");
        proposal.status = ProposalStatus.Passed;

        emit Finalize(_id, proposal.recipient, ProposalStatus.Passed);
    }
}
