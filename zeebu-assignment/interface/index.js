// import Web3 from 'web3';
// import { Common } from '@ethereumjs/common';
// import { privateToAddress } from 'ethereumjs-util';
// import InvoiceFactoryABI from './src/abi/Invoice.json' assert { type: 'json' };
// import GasStationABI from './src/abi/GasStation' assert { type: 'json' };
// import USDTABI from './src/abi/USDT' assert { type: 'json' };
// import SmartAccountABI from './src/abi/SmartAccount.json' assert { type: 'json' };

// // Initialize Web3 with Optimism Sepolia provider
// const web3 = new Web3('https://opt-sepolia.g.alchemy.com/v2/inBQ-e1vFDAlCRl4Fvec26vIYNLpBVul');

// // Contract addresses
// const InvoiceFactoryAddress = "0x38A68C29fdcb361696008d7019FdCfA54AFb1502";
// const GasStationAddress = "0x3e0Cf73Aa651fcE452Dd53346B1C80E9c7d249Bb";
// const SmartAccountAddress = "0x457109e25170AC1109533ab035F28bFf0755335D";
// const USDTAddress = "0xebca682b6C15d539284432eDc5b960771F0009e8";

// // Admin private key
// const adminPrivateKey = Buffer.from('e4c01e520d38ef61ddb5a75eb14d0aa014c8da0f615fbdece2c94cd4ae9be0c0', 'hex');

// // Initialize Contract Instances
// const invoiceFactory = new web3.eth.Contract(InvoiceFactoryABI, InvoiceFactoryAddress);
// const gasStation = new web3.eth.Contract(GasStationABI, GasStationAddress);
// const usdt = new web3.eth.Contract(USDTABI, USDTAddress);
// const smartAccount = new web3.eth.Contract(SmartAccountABI, SmartAccountAddress);

// // Function to send transaction
// async function sendTransaction(txData) {
//     try {
//         const account = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);
//         web3.eth.accounts.wallet.add(account);
        
//         const gas = await web3.eth.estimateGas(txData);
//         const gasPrice = await web3.eth.getGasPrice();
        
//         const tx = {
//             ...txData,
//             gas: BigInt(Math.floor(Number(gas) * 1.2)), // Add 20% buffer
//             maxFeePerGas: gasPrice,
//             maxPriorityFeePerGas: BigInt(Math.floor(Number(gasPrice) / 2)),
//             nonce: await web3.eth.getTransactionCount(account.address),
//             type: '0x2', // EIP-1559 transaction type
//             chainId: 11155420 // Optimism Sepolia chain ID
//         };

//         const signedTx = await web3.eth.accounts.signTransaction(tx, adminPrivateKey);
//         const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
//         return receipt;
//     } catch (error) {
//         console.error('Transaction error:', error);
//         throw error;
//     }
// }

// // Function to view invoice details
// export async function viewInvoice(invoiceId) {
//     try {
//         const invoice = await invoiceFactory.methods.invoices(invoiceId).call();
//         console.log('Invoice Details:', invoice);
//         return invoice;
//     } catch (error) {
//         console.error('Error fetching invoice:', error);
//         throw error;
//     }
// }

// // Function to create an invoice
// export async function createInvoice(merchant, customer, nameOfMerchant, productCostPerUnit, quantity, taxRateInBps, discountInBps, gstinOfMerchant) {
//     try {
//         const generateInvoice = {
//             merchant,
//             customer,
//             nameOfMerchant,
//             productCostPerUnit,
//             quantity,
//             taxRateInBps,
//             discountInBps,
//             gstinOfMerchant
//         };

//         const data = invoiceFactory.methods.createInvoice(generateInvoice).encodeABI();
        
//         const txData = {
//             to: InvoiceFactoryAddress,
//             data: data,
//             from: web3.eth.accounts.privateKeyToAccount(adminPrivateKey).address
//         };

//         const receipt = await sendTransaction(txData);
//         console.log('Invoice created successfully:', receipt.transactionHash);
//         return receipt;
//     } catch (error) {
//         console.error('Error creating invoice:', error);
//         throw error;
//     }
// }

// // Function to pay invoice
// export async function payInvoice(invoiceId) {
//     try {
//         const invoice = await viewInvoice(invoiceId);
//         const amountToBePaid = invoice.totalAmountIncludingTax;

//         // Approve USDT transfer
//         const approveTx = {
//             to: USDTAddress,
//             data: usdt.methods.approve(InvoiceFactoryAddress, amountToBePaid).encodeABI(),
//             from: web3.eth.accounts.privateKeyToAccount(adminPrivateKey).address
//         };
//         await sendTransaction(approveTx);
//         console.log('USDT approved for Invoice Payment');

//         // Pay invoice
//         const payTx = {
//             to: GasStationAddress,
//             data: gasStation.methods.sponsorTransaction(
//                 InvoiceFactoryAddress,
//                 invoiceFactory.methods.payInvoiceById(invoiceId).encodeABI(),
//                 200000
//             ).encodeABI(),
//             from: web3.eth.accounts.privateKeyToAccount(adminPrivateKey).address
//         };
//         const receipt = await sendTransaction(payTx);
//         console.log('Invoice paid successfully:', receipt.transactionHash);
//         return receipt;
//     } catch (error) {
//         console.error('Error paying invoice:', error);
//         throw error;
//     }
// }

// // Test function
// async function testInvoice() {
//     try {
//         const receipt = await createInvoice(
//             "0x11e9890626D6cC378d1c9B845B44e6AA77503e46",
//             "0x7b1C769030Cf2cA442912bEa381a51C043A63e43",
//             "Preet",
//             1000000,
//             10,
//             10,
//             0,
//             123456789
//         );
//         console.log('Test completed successfully:', receipt);
//     } catch (error) {
//         console.error('Test failed:', error);
//     }
// }

// // Run test if this is the main module
// if (import.meta.url === new URL(import.meta.url).href) {
//     testInvoice();
// }