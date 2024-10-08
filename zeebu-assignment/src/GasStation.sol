// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

contract GasStation {
    event GasSponsorship(address indexed user, uint256 gasUsed, address indexed targetContract, bytes data);

    address public owner;

    constructor() {
        owner = msg.sender;
    }
    receive() external payable {}

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    /**
    @notice This is the core function of the GasStation contract. It is used to sponsor any kind of transaction using this gas station contract
    @param data The function data to be executed via this sponsored call
    @param gasLimit Setting sufficient gas limit to be used, generally to be set to a high number, excess gas shall be refunded back.
    */
    function sponsorTransaction(
        address targetContract,
        bytes calldata data,
        uint256 gasLimit
    ) external {
        uint256 initialGas = gasleft();

        // Execute the target function call
        (bool success, ) = targetContract.call{gas: gasLimit}(data);
        require(success, "Transaction failed");

        // Calculate gas used
        uint256 gasUsed = initialGas - gasleft();
        require(gasUsed <= gasLimit, "Gas used exceeds gas limit");

        // Pay the gas fee (this contract must have sufficient balance)
        (bool reimbursementSuccess, ) = msg.sender.call{value: gasUsed * tx.gasprice}("");
        require(reimbursementSuccess, "Failed to reimburse gas");

        emit GasSponsorship(msg.sender, gasUsed, targetContract, data);
    }

    // Withdraw funds from gas station
    function withdraw(uint256 amount) external onlyOwner {
        payable(owner).transfer(amount);
    }
}
