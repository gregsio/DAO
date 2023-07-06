//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.18;

import "hardhat/console.sol";
import "./Token.sol";

contract DAO {
    address owner;
    Token public token;
    uint256 public quorum;

    struct Proposal {
        uint id;
        string name;
        uint256 amount;
        address payable recipient;
        uint256 votes;
        bool finalized;
    }

    uint256 public proposalCount;
    mapping (uint => Proposal) public proposals;
    mapping(address voter => mapping(uint256 => bool)) votes;

    event Propose(
        uint id,
        uint256 amount,
        address recipient,
        address creator
    );

    event Vote(
        uint id,
        address investor
    );

    event Finalize(
        uint id
    );

    constructor(Token _token, uint256 _quorum) {
        owner = msg.sender;
        token = _token;
        quorum = _quorum;
        proposalCount = 0;
    }

    modifier onlyInvestor(){
        require(token.balanceOf(msg.sender) > 0, 'Must be a token holder');
        _;
    }

    // Allow contract to receive Ether
    receive() external payable {}

    function createProposal(
        string memory _name,
        uint256 _amount,
        address payable _recipient
    ) external onlyInvestor {

        require(address(this).balance >= _amount);
        require(bytes(_name).length > 0,'Proposal must have a description');
        proposalCount++;
        proposals[proposalCount] = Proposal(
            proposalCount,
            _name,
            _amount,
            _recipient,
            0,
            false
        );
        emit Propose(proposalCount, _amount, _recipient, msg.sender);
    }

    function vote(uint256 _id) external onlyInvestor{
        
        // Unsure voters can vote only once
        require(!votes[msg.sender][_id], 'Already voted');

        // Fetch proposal
       Proposal storage proposal = proposals[_id];
        
        // Update votes
        proposal.votes += token.balanceOf(msg.sender); //wheighted votes
        
        // Track that user has voted
        votes[msg.sender][_id] = true;
        
        // Emit an event
        emit Vote(_id, msg.sender);
    }

    function downvote(uint256 _id) external onlyInvestor{
        
        // Unsure voters can vote only once
        require(!votes[msg.sender][_id], 'Already voted');

        // Fetch proposal
       Proposal storage proposal = proposals[_id];
        
        // Update votes
        proposal.votes -= token.balanceOf(msg.sender); //wheighted votes
        
        // Track that user has voted
        votes[msg.sender][_id] = true;
        
        // Emit an event
        emit Vote(_id, msg.sender);
    }

    function finalizeProposal(uint _id) external onlyInvestor{

        // Fetch proposal
        Proposal storage proposal = proposals[_id];

        // Ensure proposal is not already finalized
        require(!proposal.finalized,'Proposal already finalized');

        // Mark proposal as finalized
        proposal.finalized = true;

        // Check proposal has enough votes
        require(proposal.votes >= quorum, 'Proposal must reach a quorum of votes');

        // Check that contract has enough ether
        require(address(this).balance >= proposal.amount);

        // Transfer the funds to recipient
        (bool sent, ) = proposal.recipient.call{value: proposal.amount}("");
        require(sent);

        // emit event
        emit Finalize(_id);
    }
}
