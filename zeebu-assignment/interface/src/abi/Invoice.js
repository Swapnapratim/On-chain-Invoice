 const InvoiceFactoryABI = [
    {
        "type": "constructor",
        "inputs": [
            {
                "name": "_usdt",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "_gasSponsor",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "createInvoice",
        "inputs": [
            {
                "name": "generateInvoice",
                "type": "tuple",
                "internalType": "struct IInvoice.GenerateInvoice",
                "components": [
                    {
                        "name": "merchant",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "customer",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "nameOfMerchant",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "productCostPerUnit",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "quantity",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "taxRateInBps",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "discountInBps",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "gstinOfMerchant",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            }
        ],
        "outputs": [
            {
                "name": "invoice",
                "type": "tuple",
                "internalType": "struct IInvoice.Invoice",
                "components": [
                    {
                        "name": "id",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "dateOfTxn",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "dateOfInvoiceGeneration",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "merchant",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "customer",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "nameOfMerchant",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "productCostPerUnit",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "quantity",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "taxRateInBps",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "totalAmountIncludingTax",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "discountInBps",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "gstinOfMerchant",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "payingMode",
                        "type": "string",
                        "internalType": "string"
                    }
                ]
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "gasSponsor",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "invoices",
        "inputs": [
            {
                "name": "id",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "id",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "dateOfTxn",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "dateOfInvoiceGeneration",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "merchant",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "customer",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "nameOfMerchant",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "productCostPerUnit",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "quantity",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "taxRateInBps",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "totalAmountIncludingTax",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "discountInBps",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "gstinOfMerchant",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "payingMode",
                "type": "string",
                "internalType": "string"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "owner",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "payInvoice",
        "inputs": [
            {
                "name": "customer",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "merchant",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [

        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "payInvoiceById",
        "inputs": [
            {
                "name": "_id",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [

        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "renounceOwnership",
        "inputs": [

        ],
        "outputs": [

        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "s_usdt",
        "inputs": [

        ],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "contract IERC20"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "transferOwnership",
        "inputs": [
            {
                "name": "newOwner",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [

        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "GasSponsorChanged",
        "inputs": [
            {
                "name": "newSponsor",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "InvoiceCreated",
        "inputs": [
            {
                "name": "id",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "InvoicePaid",
        "inputs": [
            {
                "name": "customer",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "merchant",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "OwnershipTransferred",
        "inputs": [
            {
                "name": "previousOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "newOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "OwnableInvalidOwner",
        "inputs": [
            {
                "name": "owner",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "OwnableUnauthorizedAccount",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "internalType": "address"
            }
        ]
    }
]
export default InvoiceFactoryABI;