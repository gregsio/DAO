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

    event Propose(
        uint id,
        uint256 amount,
        address recipient,
        address creator
    );

    constructor(Token _token, uint256 _quorum) {
        owner = msg.sender;
        token = _token;
        quorum = _quorum;
        proposalCount = 0;
    }

    modifier onlyInvestor(){
        require(token.balanceOf(msg.sender) > 0, 'Must be a token holder to make a proposal');
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

}

