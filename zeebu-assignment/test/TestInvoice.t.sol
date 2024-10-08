// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Test, console2 } from "forge-std/Test.sol";
import { SmartAccount } from "src/SmartAccount.sol";
import { DeploySmartAccount, HelperConfig } from "script/DeploySmartAccount.s.sol";
import { MockERC20 } from "./mocks/MockERC20.sol";
import { PackedUserOperation } from "lib/account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import { IEntryPoint } from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import { MessageHashUtils } from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { ValidationData } from "lib/account-abstraction/contracts/core/Helpers.sol";
import { SendPackedUserOps } from "script/SendPackedUserOps.s.sol";
import { InvoiceFactory } from "src/InvoiceFactory.sol";
import { IInvoice } from "src/interfaces/IInvoice.sol";
import { GasStation } from "src/GasStation.sol";

contract TestInvoice is Test {
    using MessageHashUtils for bytes32;

    SmartAccount smartAccount;
    HelperConfig config;
    DeploySmartAccount deploySmartAccount;
    SendPackedUserOps sendPackedUserOps;
    MockERC20 usdt;
    IEntryPoint entryPoint;
    InvoiceFactory invoiceFactory;
    GasStation gasStation;
    address user;
    uint256 userKey;
    address payable randomUser;
    address payable merchant;
    address deployer;

    function setUp() public {
        deployer = msg.sender; // This will be foundry's default deployer address
        config = new HelperConfig();
        deploySmartAccount = new DeploySmartAccount();
        sendPackedUserOps = new SendPackedUserOps();
        usdt = new MockERC20();
        entryPoint = IEntryPoint(config.getConfigByChainId(block.chainid).entryPoint);
        
        // Deploy gas station contract
        gasStation = new GasStation(); // Initialize with Invoice contract address
        
        // Fund the gas station directly
        (bool success,) = address(gasStation).call{value: 20 ether}("");
        require(success, "Failed to send ETH to gas station");

        (user, userKey) = makeAddrAndKey("user");
        randomUser = payable(makeAddr("randomUser"));
        merchant = payable(makeAddr("merchant"));
        (config, smartAccount) = deploySmartAccount.deploySmartAccount();
        invoiceFactory = new InvoiceFactory(address(usdt), address(gasStation));
        vm.deal(address(smartAccount), 100 ether);
    } 

    /**
    @dev This test is to ensure that the smart contract wallet is following ERC-4337 standard and can execute functions via EntryPoint's handleOps. Hence it can handle all kinds of operations
    */
    function test_EntryPointExecutePayInvoice() public {
        // SmartAccount -> Invoice.payInvoice() -> USDT.transferFrom() -> Merchant
        // Setup amounts
        uint256 amount = 1e18;
        
        // Mint tokens to smart account
        vm.prank(address(smartAccount));
        usdt.mint();
        
        // Smart account approves the Invoice contract for transfers
        vm.prank(address(smartAccount));
        usdt.approve(address(invoiceFactory), amount);
        
        // Create the call to Invoice.payInvoice()
        bytes memory data = abi.encodeWithSelector(
            InvoiceFactory.payInvoice.selector,
            address(smartAccount), // customer
            merchant,             // merchant
            amount               // amount
        );
        
        // Create execution call
        bytes memory executeCallData = abi.encodeWithSelector(
            smartAccount.execute.selector,
            address(invoiceFactory),  // target is now Invoice contract
            0,                // no value sent
            data
        );
        
        // Create and sign user operation
        PackedUserOperation memory packedUserOp = sendPackedUserOps.createSignedUserOps(
            executeCallData,
            config.getConfig(),
            address(smartAccount)
        );
        
        // Execute via EntryPoint
        PackedUserOperation[] memory userOps = new PackedUserOperation[](1);
        userOps[0] = packedUserOp;
        vm.startPrank(address(gasStation));  // randomUser is our gas sponsor
        IEntryPoint(config.getConfig().entryPoint).handleOps(userOps, randomUser);
        
        // Verify transfer
        assertEq(usdt.balanceOf(merchant), amount);
    }

    function test_GasStationExecutePayInvoice() public {
        // SmartAccount -> Invoice.payInvoice() -> USDT.transferFrom() -> Merchant
        // Setup amounts
        uint256 amount = 1e18;
        
        // Mint tokens to smart account
        vm.prank(address(smartAccount));
        usdt.mint();
        
        // Smart account approves the Invoice contract for transfers
        vm.prank(address(smartAccount));
        usdt.approve(address(invoiceFactory), amount);
        
        // Create the call to Invoice.payInvoice()
        bytes memory data = abi.encodeWithSelector(
            InvoiceFactory.payInvoice.selector,
            address(smartAccount), // customer
            merchant,             // merchant
            amount                // amount
        );

        // Sponsor the transaction via the gas station
        vm.startPrank(address(gasStation));
        gasStation.sponsorTransaction(address(invoiceFactory), data, 100000); // Adjust gas limit as needed
        vm.stopPrank();

        // Verify transfer
        assertEq(usdt.balanceOf(merchant), amount);
    }

    function test_PayInvoiceByIdSponsored() public {
        // Mint tokens to smart account
        vm.prank(address(smartAccount));
        usdt.mint();

        IInvoice.GenerateInvoice memory generateInvoice = IInvoice.GenerateInvoice({
            merchant: merchant,
            customer: address(smartAccount),
            nameOfMerchant: "Test Merchant",
            productCostPerUnit: 1e18,
            quantity: 10,
            taxRateInBps: 10,
            discountInBps: 0,
            gstinOfMerchant: 1234567890
        });
        
        // Create the invoice
        vm.prank(address(gasStation));
        IInvoice.Invoice memory invoice = invoiceFactory.createInvoice(generateInvoice);

        uint256 amountToBePaid = invoice.totalAmountIncludingTax;

        // Smart account approves the Invoice contract for transfers
        vm.prank(address(smartAccount));
        usdt.approve(address(invoiceFactory), amountToBePaid);

        // First create the payInvoiceById call data
        bytes memory invoiceCallData = abi.encodeWithSelector(
            InvoiceFactory.payInvoiceById.selector,
            invoice.id
        );

        // Then wrap it in the smart account's execute call
        bytes memory wrappedCallData = abi.encodeWithSelector(
            SmartAccount.execute.selector,
            address(invoiceFactory),  // target
            0,                        // value
            invoiceCallData          // data
        );

        vm.startPrank(deployer);
        // Use the wrapped call data when sponsoring the transaction
        gasStation.sponsorTransaction(
            address(smartAccount),    // target is the smart account
            wrappedCallData,         // using the wrapped call data
            2000000                  // gas limit
        );
        vm.stopPrank();

        // Verify transfer
        assertEq(usdt.balanceOf(merchant), amountToBePaid);
    }
}
