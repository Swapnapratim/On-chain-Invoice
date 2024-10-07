// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IInvoice {

    struct Invoice {
        uint256 id;
        uint256 dateOfTxn;
        uint256 dateOfInvoiceGeneration;
        address merchant;
        address customer;
        string nameOfMerchant;
        uint256 productCostPerUnit;
        uint256 quantity;
        uint256 taxRateInBps;
        uint256 totalAmountIncludingTax;
        uint256 discountInBps;
        uint256 gstinOfMerchant;
        string payingMode;
    }

    struct GenerateInvoice {
        address merchant;
        address customer;
        string nameOfMerchant;
        uint256 productCostPerUnit;
        uint256 quantity;
        uint256 taxRateInBps;
        uint256 discountInBps;
        uint256 gstinOfMerchant;
    }
}