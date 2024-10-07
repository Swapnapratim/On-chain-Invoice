const GasStationABI  = [
    {
        "type": "constructor",
        "inputs": [

        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "receive",
        "stateMutability": "payable"
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
        "name": "sponsorTransaction",
        "inputs": [
            {
                "name": "targetContract",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "data",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "gasLimit",
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
        "name": "withdraw",
        "inputs": [
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
        "type": "event",
        "name": "GasSponsorship",
        "inputs": [
            {
                "name": "user",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "gasUsed",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "targetContract",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "data",
                "type": "bytes",
                "indexed": false,
                "internalType": "bytes"
            }
        ],
        "anonymous": false
    }
]
export default GasStationABI;