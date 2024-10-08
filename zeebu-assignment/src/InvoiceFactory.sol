// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {IInvoice} from "./interfaces/IInvoice.sol";

contract InvoiceFactory is Ownable { // IF: 0x38A68C29fdcb361696008d7019FdCfA54AFb1502, GSN: 0x3e0Cf73Aa651fcE452Dd53346B1C80E9c7d249Bb

    /*//////////////////////////////////////////////////////////////
                             EVENTS
    //////////////////////////////////////////////////////////////*/

    event InvoiceCreated(uint256 id);
    event InvoicePaid(address indexed customer, address indexed merchant, uint256 amount);
    event GasSponsorChanged(address indexed newSponsor);

    /*//////////////////////////////////////////////////////////////
                             STATE
    //////////////////////////////////////////////////////////////*/

    IERC20 public immutable s_usdt; // USDT token contract
    address public gasSponsor; // Gas sponsor wallet/contract
    mapping(uint256 id => IInvoice.Invoice) public invoices;

    /*//////////////////////////////////////////////////////////////
                            CONTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address _usdt, address _gasSponsor) Ownable(msg.sender){
        require(_usdt != address(0), "Invalid USDT address");
        require(_gasSponsor != address(0), "Invalid gas sponsor address");

        s_usdt = IERC20(_usdt);
        gasSponsor = _gasSponsor;
    }

    /*//////////////////////////////////////////////////////////////
                            EXTERNAL / PUBLIC
    //////////////////////////////////////////////////////////////*/

    /**
    @notice This function is used by merchant to create an invoice. Transaction is executed by the gas station keeping the transaction completely gasless
    @param generateInvoice struct used as a parameter to avoid Stack-to-deep errors
    */
    function createInvoice(IInvoice.GenerateInvoice memory generateInvoice) external returns(IInvoice.Invoice memory invoice){
        invoice.merchant = generateInvoice.merchant;
        invoice.customer = generateInvoice.customer;
        invoice.nameOfMerchant = generateInvoice.nameOfMerchant;
        invoice.productCostPerUnit = generateInvoice.productCostPerUnit;
        invoice.quantity = generateInvoice.quantity;
        invoice.taxRateInBps = generateInvoice.taxRateInBps;
        invoice.discountInBps = generateInvoice.discountInBps;
        invoice.gstinOfMerchant = generateInvoice.gstinOfMerchant;
        invoice.payingMode = "USDT";

        // Calculate total amount including tax
        uint256 baseCost = generateInvoice.productCostPerUnit * generateInvoice.quantity;
        // tax multplier:
        uint256 taxMultiplier = 10_000 + generateInvoice.taxRateInBps;
        // discount multiplier:
        uint256 discountMultiplier = 10_000 - generateInvoice.discountInBps;
        // Calculate the total amount (base cost * tax multiplier * discount multiplier) divided by 10,000 twice to handle the bps
        // Formula for totalAmount:
        // totalAmount = (productCostPerUnit * quantity * (10,000 + taxRateInBps) * (10,000 - discountInBps)) / 10,000 / 10,000

        // Explanation:
        // - productCostPerUnit * quantity: Calculates the base cost for the given quantity of the product.
        // - (10,000 + taxRateInBps): Adds the tax rate in basis points to 10,000 to get the tax multiplier.
        // - (10,000 - discountInBps): Subtracts the discount rate in basis points from 10,000 to get the discount multiplier.
        // - Dividing by 10,000 twice: Normalizes the result to account for both the tax and discount being in basis points (bps).

        uint256 totalAmount = (baseCost * taxMultiplier * discountMultiplier) / 10_000 / 10_000;

        invoice.totalAmountIncludingTax = totalAmount;
        invoice.dateOfInvoiceGeneration =  block.timestamp;

        // generate a random 10 digit id for the invoice
        invoice.id = _generateRandomInvoiceId(
            generateInvoice.merchant,
            generateInvoice.customer,
            generateInvoice.nameOfMerchant,
            generateInvoice.productCostPerUnit,
            generateInvoice.taxRateInBps,
            generateInvoice.discountInBps,
            generateInvoice.gstinOfMerchant,
            generateInvoice.quantity
        );

        invoices[invoice.id] = invoice;
        emit InvoiceCreated(invoice.id);
    }

    /**
    * @notice Customer pays invoice by id
    * @param _id unique invoice id that is generated after an invoice is created by the merchant
    */
    function payInvoiceById(
        uint256 _id
    ) external {
        require(_id > 0, "Invalid invoice ID");
        IInvoice.Invoice memory invoice = invoices[_id];

        bool success = s_usdt.transferFrom(invoice.customer, invoice.merchant, invoice.totalAmountIncludingTax);
        if(success) {
            delete invoices[_id];
            emit InvoicePaid(invoice.customer, invoice.merchant, invoice.totalAmountIncludingTax);
        } else {
            revert("Transfer failed");
        }
    }


    /**
     * @notice Customer pays an invoice to the merchant in USDT.
     *         The payment transaction is sponsored by the gas sponsor through a relayer.
     * @param customer The customer (smart wallet) paying the invoice.
     * @param merchant The merchant receiving the payment.
     * @param amount The amount of USDT to be paid.
     */
    function payInvoice(
        address customer,
        address merchant,
        uint256 amount
    ) external {
        require(merchant != address(0), "Invalid merchant address");
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer directly using USDT contract
        bool success = s_usdt.transferFrom(customer, merchant, amount);
        require(success, "Transfer failed");

        emit InvoicePaid(customer, merchant, amount);
    }

    /*//////////////////////////////////////////////////////////////
                        PRIVATE / INTERNAL
    //////////////////////////////////////////////////////////////*/

    // Private function to generate a random 10-digit invoice ID based on the provided parameters
    function _generateRandomInvoiceId(
        address _merchant,
        address _customer,
        string memory _nameOfMerchant,
        uint256 _productCostPerUnit,
        uint256 _taxRateInBps,
        uint256 _discountInBps,
        uint256 _gstinOfMerchant,
        uint256 quantity
    ) private view returns (uint256) {
        // Use the provided parameters to generate a hash and ensure randomness
        bytes32 hash = keccak256(
            abi.encodePacked(
                _merchant,
                _customer,
                _nameOfMerchant,
                _productCostPerUnit,
                _taxRateInBps,
                _discountInBps,
                _gstinOfMerchant,
                quantity,
                block.timestamp
            )
        );

        // Convert the hash to a uint256 and reduce it to a 10-digit number using modulo operation
        uint256 invoiceId = uint256(hash) % 1e10;

        // Ensure it's a 10-digit number
        if (invoiceId < 1e9) {
            invoiceId += 1e9;  // Add a base to ensure it's at least 10 digits
        }

        return invoiceId;
    }
}
