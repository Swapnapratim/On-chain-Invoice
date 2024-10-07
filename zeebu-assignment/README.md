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

