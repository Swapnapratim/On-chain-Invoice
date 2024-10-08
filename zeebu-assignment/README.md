# GOAL
- Create a straightforward invoice contract that allows customers to pay merchants in USDT. 
- The payment process should be designed such that transaction fees (gas fees) are sponsored by an external entity, such as a gas-sponsor or a gas-station contract/wallet, thereby alleviating the customer from the burden of gas fees.

1. Create a smart contract minimal account. This smart wallet should handle various user-specific transactions and interactions securely and efficiently

2. Create an invoice smart contract that allows customers to pay merchants in USDT. The payment process should be designed such that transaction fees (gas fees) are sponsored by an external entity, such as a gas-sponsor or a gas-station contract/wallet, thereby alleviating the customer from the burden of gas fees.

## Flow: 
```plaintext
[User]
   |
   | (1) Initiate payment
   |
   v
[GasStation]
   |
   | (2) Calculate initial gas
   |
   | (3) Call Invoice Contract
   |
   v
[Invoice Contract]
   |
   | (4) Transfer USDT to Merchant
   |
   v
[GasStation]
   |
   | (5) Calculate gas used
   |
   | (6) Reimburse gas fee
   |
   | (7) Emit gas sponsorship event
   |
   v
[Merchant]
   |
   | (8) Receive USDT payment
   |
   v
[User]
   |
   | (9) Transaction complete
```

## Project Structure: 
Considering you are in the root directory of the project, the project structure is as follows:
- interface: React frontend
- src: Solidity Smart Contracts
- src/interfaces: Smart Contract Interfaces
- test: Foundry Unit tests
- script: Deployment scripts for forked testings
- foundry.toml: Foundry config file
## Local Production Requirements: 
- RPC URL of desired test net
- Private Key
- USDT token address of desired test net
- EntryPoint contract address

Be sure to add your RPC_URL and PRIVATEE_KEY at the required fields here: `interface/src/App.js`

## Instructions to start local server: 
1. cd into Interface (cd interface)
2. npm install
3. npm start (to start the local server)

## Small Description of the Interface:
- There will be 3 buttons: 
## 1. Create Invoice 
- Merchant Address
- Customer Address (Smart Account)
- Merchant Name
- Product Cost per unit
- Quantity
- Tax Rate in Basis Points
- Discount Rate in  Basis Points
- GSTIN

   This function shall generate an Invoice Id that will be emitted through an event

## 2. Pay Invoice  
Parameter required is just the Invoice Id since it invoked the `payInvoiceById` function  of the Invoice Contract. This shall pay the required invoice amount to the merchant without any gas. 
## 3. View Invoice  
This will display the Invoice details
## 4. Test Invoice 
This is a test function button that will generate an invoice as per the parameters specified in the script interface/src/App.js

## Source Contract Addresses
   - InvoiceFactory = "0x8DD4f74c9487592e60a18e269eEAbB077049d6f0"
   - GasStation = "0x7401770d7DcA314332Db3eca9d718A5Bf5219Ad5"
   - SmartAccount = "0x5282e301214cf0A95CEf8E347764c4Dddd867d62"
   - MockUSDT = "0x884Ea8FB01727A643cbc9100b7eCEd0648f15963"

## Run Tests
1. cd into the root directory
2. `forge install`
3. `forge build`
4. `forge test`

### Miscallaneous

- Tests descriptions are given in the test file : src/test/TestInvoice.t.sol
- All contracts are well documented. 
If you have any questions, please feel free to reach out to me.
