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

    /* @notice Structure for proposals */
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 amount;
        address payable recipient;
        int256 votes;
        bool finalized;
    }

    uint256 public proposalCount;

    // KEY: Proposal ID
    // VALUE: Proposal
    // Mapping of proposal ID to proposal
    mapping(uint256 => Proposal) public proposals;

    // KEY: Investor address and Proposal ID
    // VALUE: Delegatee address
    // Mapping of investor address to proposal ID to voting power
    mapping(address => mapping(uint256 => uint256)) public votesCast;

    // KEY: Delegator address
    // VALUE: Delegatee address
    // Mapping of delegator address to delegatee address
    mapping(address => address) public delegatorDelegatee;

    // KEY: Delegatee address and Delegator index
    // VALUE: Delegator address
    // Mapping of delegatee address to delegator index to delegator address
    mapping(address => mapping(uint256 => address)) public delegateeDelegators;

    // KEY: Delegatee address
    // VALUE: Delegator count
    // Mapping of delegatee address to delegator count
    mapping(address => uint256) public delegateeDelegatorCount;

    // KEY: Delegatee address and Delegator address
    // VALUE: Delegator index
    // Mapping of delegatee address to delegator address to delegator index
    mapping(address => mapping(address => uint256)) public delegatorIndex;

    // KEY: Delegatee address
    // VALUE: Votes received from delegators
    // Mapping of delegatee address to voting power received from delegators
    mapping(address => uint256) public delegateeVotesReceived;

    event Propose(
        uint256 id,
        uint256 amount,
        address recipient,
        address creator,
        string description
    );

    event Delegate(address indexed from, address indexed to);
    event Undelegate(address indexed from, address indexed to);

    event UpVote(uint256 id, address investor);
    event DownVote(uint256 id, address investor);


    event Finalize(uint256 id, address recipient);

    /* @notice Constructor for creating the DAO
     * @param _token The token used for the DAO
     * @param _quorum The minimum number of votes required for a proposal to pass
     */
    constructor(Token _token, uint256 _quorum) {
        owner = msg.sender;
        token = _token;
        quorum = _quorum;
    }

    /* @notice Modifier to ensure the function caller is a token holder */
    modifier onlyInvestor() {
        require(token.balanceOf(msg.sender) > 0, "Must be token holder");
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
        require(token.balanceOf(address(this)) >= _amount, "Not enough funds");

        proposalCount++;

        proposals[proposalCount] = Proposal(
            proposalCount,
            _title,
            _description,
            _amount,
            _recipient,
            0,
            false
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
        require(token.balanceOf(msg.sender) > 0, "Must be token holder to delegate");
        require(_delegatee != msg.sender, "Cannot delegate to self");
        require(_delegatee != address(0), "Cannot delegate to 0x0 address");
        require(token.balanceOf(_delegatee) > 0, "Must be token holder to receive delegation");

        if(delegatorDelegatee[msg.sender] != address(0)) {
            undelegate();
        }

        // Delegate votes
        delegateeDelegators[_delegatee][delegateeDelegatorCount[_delegatee]] = msg.sender;
        delegatorIndex[_delegatee][msg.sender] = delegateeDelegatorCount[_delegatee];
        delegateeDelegatorCount[_delegatee]++;

        delegateeVotesReceived[_delegatee] += token.balanceOf(msg.sender);

        // Update delegatee's votes on live proposals
        for(uint256 i = 1; i <= proposalCount; i++) {
            // Check if the proposal is live, the delegatee has voted, and the delegator has not
            if(proposals[i].finalized == false && votesCast[_delegatee][i] > 0 && votesCast[msg.sender][i] == 0) {
                proposals[i].votes += int(token.balanceOf(msg.sender));
            }
        }

        emit Delegate(msg.sender, _delegatee);
    }

    /* @notice Undelegate a vote
     */
    function undelegate() public onlyInvestor {
        require(delegatorDelegatee[msg.sender] != address(0), "Not delegated");

        address removedDelegatee = delegatorDelegatee[msg.sender];

        // Remove delegator's votes from delegateeVotesReceived
        uint256 voterBalance = token.balanceOf(msg.sender);
        delegateeVotesReceived[removedDelegatee] -= voterBalance;

        // Remove delegator's votes from live proposals
        for(uint256 i = 1; i <= proposalCount; i++) {
            // Check if the proposal is live, and the delegator has voted
            if(proposals[i].finalized == false && votesCast[msg.sender][i] > 0) {
                votesCast[removedDelegatee][i] -= voterBalance;
                proposals[i].votes -= int(voterBalance);
            }
        }

        // Remove delegator from delegateeDelegators
        uint256 indexToRemove = delegatorIndex[removedDelegatee][msg.sender];
        address lastDelegator = delegateeDelegators[removedDelegatee][delegateeDelegatorCount[removedDelegatee] - 1];
        delegateeDelegators[removedDelegatee][indexToRemove] = lastDelegator;
        delegatorIndex[removedDelegatee][lastDelegator] = indexToRemove;
        delegateeDelegatorCount[removedDelegatee]--;

        // Reset delegatorDelegatee to 0x0 address
        delete delegatorDelegatee[msg.sender];

        emit Undelegate(msg.sender, removedDelegatee);
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
            voteWeight += delegateeVotesReceived[msg.sender];
        }

        proposal.votes += int(voteWeight);

        // Record the votes casted by the voter and all the delegators who delegated to this voter
        votesCast[msg.sender][_id] = voteWeight;
        for(uint256 i = 0; i < delegateeDelegatorCount[msg.sender]; i++) {
            address delegator = delegateeDelegators[msg.sender][i];
            votesCast[delegator][_id] = token.balanceOf(delegator);
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
            voteWeight += delegateeVotesReceived[msg.sender];
        }

        proposal.votes -= int(voteWeight);

        // Record the votes casted by the voter and all the delegators who delegated to this voter
        votesCast[msg.sender][_id] = voteWeight;
        for(uint256 i = 0; i < delegateeDelegatorCount[msg.sender]; i++) {
            address delegator = delegateeDelegators[msg.sender][i];
            votesCast[delegator][_id] = token.balanceOf(delegator);
        }

        emit DownVote(_id, msg.sender);
    }

    /* @notice Finalize a proposal
     * @param _id The ID of the proposal to finalize
     */
    function finalizeProposal(uint256 _id) external onlyInvestor {
        Proposal storage proposal = proposals[_id];

        require(!proposal.finalized, "Already finalized");
        require(proposal.votes >= int(quorum), "Not enough votes");
        require(token.balanceOf(address(this)) >= proposal.amount, "Not enough funds");

        require(token.transfer(proposal.recipient, proposal.amount), "Transfer failed");

        proposal.finalized = true;

        emit Finalize(_id, proposal.recipient);
    }
}
