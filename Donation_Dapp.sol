// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Donation {
    address payable public owner;  // Changed to payable
    uint256 public totalDonations;

    struct DonationDetail {
        address donor;
        uint256 amount;
        uint256 timestamp;
    }

    DonationDetail[] public donationHistory;
    mapping(address => uint256) public donations;

    event Donated(address indexed donor, uint256 amount);
    event Withdrawn(address indexed owner, uint256 amount);

    constructor() {
        owner = payable(msg.sender);  // Explicitly payable
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function donate() public payable {
        require(msg.value > 0, "Donation must be greater than 0");
        
        donations[msg.sender] += msg.value;
        totalDonations += msg.value;
        donationHistory.push(DonationDetail(msg.sender, msg.value, block.timestamp));
        
        emit Donated(msg.sender, msg.value);
    }

    function getAllDonations() public view returns (DonationDetail[] memory) {
        return donationHistory;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Transfer failed");
        
        emit Withdrawn(owner, balance);
    }

    // Additional helper function
    function contractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
