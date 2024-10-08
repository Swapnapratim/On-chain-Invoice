import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Wallet, JsonRpcProvider, Contract, BigNumber } from 'ethers';
import InvoiceFactoryABI from './abi/Invoice.js';
import GasStationABI from './abi/GasStation.js';
import USDTABI from './abi/USDT.js';
import SmartAccountABI from './abi/SmartAccount.js';
import './App.css';

const InvoiceFactoryAddress = "0x18C2C5eECE185851835F5b6490Ac0FD3b036f719";
const GasStationAddress = "0xbeAd97F95B7dDc8da34a388c3eD3e3954821f71B";
const USDTAddress = "0x884ea8fb01727a643cbc9100b7eced0648f15963";
const SmartAccountAddress = "0x457109e25170AC1109533ab035F28bFf0755335D"; // 2056221913

// Admin private key
const adminPrivateKey = 'e4c01e520d38ef61ddb5a75eb14d0aa014c8da0f615fbdece2c94cd4ae9be0c0';

// Alchemy Optimism Sepolia provider URL
const alchemyProviderURL = "https://opt-sepolia.g.alchemy.com/v2/inBQ-e1vFDAlCRl4Fvec26vIYNLpBVul";

// Create an ethers provider with the Alchemy Optimism Sepolia URL
const provider = new JsonRpcProvider(alchemyProviderURL);

// Initialize Wallet with admin private key
const wallet = new Wallet(adminPrivateKey, provider);

function App() {
  const [invoiceId, setInvoiceId] = useState('');
  const [merchant, setMerchant] = useState('');
  const [customer, setCustomer] = useState('');
  const [nameOfMerchant, setNameOfMerchant] = useState('');
  const [productCostPerUnit, setProductCostPerUnit] = useState('');
  const [quantity, setQuantity] = useState('');
  const [taxRateInBps, setTaxRateInBps] = useState('');
  const [discountInBps, setDiscountInBps] = useState('');
  const [gstinOfMerchant, setGstinOfMerchant] = useState('');
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [transactionHash, setTransactionHash] = useState('');
  const [error, setError] = useState(null);

  // Utility function to send transactions
  const sendTransaction = async (txData) => {
    try {
      const signer = wallet.connect(provider);
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice;
      const gasEstimate = await provider.estimateGas(txData);
      
      const tx = {
        ...txData,
        gasPrice,
        gasLimit: gasEstimate,
      };

      const signedTx = await signer.sendTransaction(tx);
      const receipt = await signedTx.wait();
      setTransactionHash(receipt.transactionHash);
      console.log('Transaction successful:', receipt.transactionHash);
      return receipt;
    } catch (error) {
      setError('Transaction error: ' + error.message);
      throw error;
    }
  };

  // Create invoice function
  const createInvoice = async () => {
    try {
      const invoiceFactoryContract = new Contract(InvoiceFactoryAddress, InvoiceFactoryABI, wallet);
      const generateInvoice = {
        merchant,
        customer,
        nameOfMerchant,
        productCostPerUnit,
        quantity,
        taxRateInBps,
        discountInBps,
        gstinOfMerchant,
      };

      const data = invoiceFactoryContract.interface.encodeFunctionData('createInvoice', [generateInvoice]);

      const txData = {
        to: InvoiceFactoryAddress,
        data: data,
        from: wallet.address,
      };
      const receipt = await sendTransaction(txData);
      // Look for the InvoiceCreated event in the transaction receipt logs
      const event = receipt.logs.find(log => log.address.toLowerCase() === InvoiceFactoryAddress.toLowerCase());
      if (event) {
          const decodedEvent = invoiceFactoryContract.interface.decodeEventLog('InvoiceCreated', event.data);
          const invoiceId = decodedEvent.id.toString();
          setInvoiceId(invoiceId);  // Store the invoiceId in state to display in the UI
          console.log('Invoice created successfully with ID:', invoiceId);
      } else {
          console.log('InvoiceCreated event not found in the logs');
      }
      return receipt;
    } catch (error) {
      setError('Error creating invoice: ' + error.message);
      throw error;
    }
  };

  // Pay invoice function
  // const payInvoice = async () => {
  //   try {
  //     const invoiceFactoryContract = new Contract(InvoiceFactoryAddress, InvoiceFactoryABI, wallet);
  //     const gasStationContract = new Contract(GasStationAddress, GasStationABI, wallet);
  //     const usdtContract = new Contract(USDTAddress, USDTABI, wallet);

  //     const invoice = await invoiceFactoryContract.invoices(invoiceId);
  //     const amountToBePaid = invoice.totalAmountIncludingTax;

  //     // Approve USDT transfer
  //     const approveTx = {
  //       to: USDTAddress,
  //       data: usdtContract.interface.encodeFunctionData('approve', [SmartAccountAddress, amountToBePaid]), // Corrected usage
  //       from: SmartAccountAddress,
  //   };    
  //     await sendTransaction(approveTx);
  //     console.log('USDT approved for Invoice Payment');

  //     // Pay invoice
  //     const payTx = {
  //       to: GasStationAddress,
  //       data: gasStationContract.interface.encodeFunctionData('sponsorTransaction', [
  //         InvoiceFactoryAddress,
  //         invoiceFactoryContract.interface.encodeFunctionData('payInvoiceById', [invoiceId]), // Use encodeFunctionData for the payInvoiceById function
  //         200000
  //       ]),
  //       from: SmartAccountAddress,
  //     };
  //     const receipt = await sendTransaction(payTx);
  //     console.log('Invoice paid successfully:', receipt.transactionHash);
  //     return receipt;
  //   } catch (error) {
  //     setError('Error paying invoice: ' + error.message);
  //     throw error;
  //   }
  // };

  // const payInvoice = async () => {
  //   console.log("here");
  //   try {
  //     console.log("Starting invoice payment process...");
  //     const invoiceFactoryContract = new Contract(InvoiceFactoryAddress, InvoiceFactoryABI, wallet);
  //     const gasStationContract = new Contract(GasStationAddress, GasStationABI, wallet);
  //     const usdtContract = new Contract(USDTAddress, USDTABI, wallet);
  
  //     // Get invoice details
  //     const invoice = await invoiceFactoryContract.invoices(invoiceId);
  //     console.log("Retrieved invoice:", invoice);
  //     const amountToBePaid = invoice.totalAmountIncludingTax;
  //     console.log("Amount to be paid:", amountToBePaid.toString());
  
  //     // First transaction: Approve USDT transfer
  //     console.log("Initiating USDT approval...");
  //     const approveTx = {
  //       to: USDTAddress,
  //       data: usdtContract.interface.encodeFunctionData('approve', [SmartAccountAddress, amountToBePaid]),
  //       from: SmartAccountAddress,
  //     };
  //     const approveReceipt = await sendTransaction(approveTx);
  //     console.log('USDT approved for Invoice Payment', approveReceipt);
  
  //     // Second transaction: Pay invoice through gas station
  //     console.log("Initiating payment transaction...");
  //     const paymentData = invoiceFactoryContract.interface.encodeFunctionData('payInvoiceById', [invoiceId]);
  //     const gasEstimate = 200000; // You might want to estimate this dynamically
  
  //     const payTx = {
  //       to: GasStationAddress,
  //       data: gasStationContract.interface.encodeFunctionData('sponsorTransaction', [
  //         InvoiceFactoryAddress,
  //         paymentData,
  //         gasEstimate
  //       ]),
  //       from: SmartAccountAddress,
  //     };
  
  //     const receipt = await sendTransaction(payTx);
  //     console.log('Invoice paid successfully:', receipt.transactionHash);
  //     setTransactionHash(receipt.transactionHash);
  //     return receipt;
  //   } catch (error) {
  //     console.error('Payment error:', error);
  //     setError('Error paying invoice: ' + error.message);
  //     throw error;
  //   }
  // };
  
  const payInvoice = async () => {
    try {
      console.log("Starting invoice payment process...");
  
      // Contracts
      const invoiceFactoryContract = new Contract(InvoiceFactoryAddress, InvoiceFactoryABI, wallet);
      const gasStationContract = new Contract(GasStationAddress, GasStationABI, wallet);
      const usdtContract = new Contract(USDTAddress, USDTABI, wallet);
      const smartAccountContract = new Contract(SmartAccountAddress, SmartAccountABI, wallet);
  
      // Get invoice details
      const invoice = await invoiceFactoryContract.invoices(invoiceId);
      console.log("Retrieved invoice:", invoice);
      const amountToBePaid = invoice.totalAmountIncludingTax;
      console.log("Amount to be paid:", amountToBePaid.toString());
  
      // First transaction: Approve USDT transfer using SmartAccount's execute function
      console.log("Initiating USDT approval through SmartAccount...");
      const approveData = usdtContract.interface.encodeFunctionData('approve', [SmartAccountAddress, amountToBePaid]);
      const approveData2 = usdtContract.interface.encodeFunctionData('approve', [InvoiceFactoryAddress, amountToBePaid]);
      const approveTx = {
        target: USDTAddress,
        value: 0n,
        data: approveData
      };


      // Step 1: Execute the first approval transaction and wait for confirmation
      const approveReceipt = await smartAccountContract.execute(approveTx.target, approveTx.value, approveTx.data);
      await approveReceipt.wait(); // Wait for the transaction to be confirmed
      console.log('USDT approved for SmartAccount');

      // Step 2: Execute the second approval transaction
      console.log("Initiating second USDT approval...");
      const approveTx2 = {
          target: USDTAddress,
          value: 0n,
          data: approveData2
      };

      const approveReceipt2 = await smartAccountContract.execute(approveTx2.target, approveTx2.value, approveTx2.data);
      await approveReceipt2.wait(); // Wait for the transaction to be confirmed
      console.log('USDT approved for Invoice Payment');
  
      // Step 3: Prepare payInvoiceById data to be called by SmartAccount
      const payInvoiceData = invoiceFactoryContract.interface.encodeFunctionData('payInvoiceById', [invoiceId]);
      console.log("Encoded data for payInvoiceById:", payInvoiceData);
      
      // Estimate gas for payInvoiceById function
      const gasEstimate = await invoiceFactoryContract.payInvoiceById.estimateGas(invoiceId);
      console.log("Gas Estimate for payInvoiceById:", gasEstimate.toString());

      // Step 4: GasStation sponsors the gas and executes payInvoiceById via SmartAccount
      console.log("Initiating gas sponsorship via GasStation...");

      const executeData = smartAccountContract.interface.encodeFunctionData('execute', [
        InvoiceFactoryAddress,  // Target contract (InvoiceFactory)
        0n,                      // Value (in ETH), since we're paying in USDT
        payInvoiceData           // Data to call payInvoiceById
      ]);

      console.log("Encoded data for execute:", executeData);

      // Step 5: GasStation calls SmartAccount's execute function
      const receipt = await gasStationContract.sponsorTransaction(
        SmartAccountAddress,  // The SmartAccount paying the invoice
        executeData,          // Data to execute the transaction (encoded execute function)
        gasEstimate   // Estimated gas
      );

      console.log('Invoice paid successfully with gas sponsorship:', receipt.transactionHash);
      setTransactionHash(receipt.transactionHash);

      return receipt;

    } catch (error) {
      console.error('Payment error:', error);
      setError('Error paying invoice: ' + error.message);
      throw error;
    }
  };
  

  // View invoice function
  const viewInvoice = async () => {
    try {
        const invoiceFactoryContract = new Contract(InvoiceFactoryAddress, InvoiceFactoryABI, wallet);
        const invoice = await invoiceFactoryContract.invoices(invoiceId);

        // Convert BigInt values to strings for JSON.stringify
        const formattedInvoice = {
            merchant: invoice.merchant,
            customer: invoice.customer,
            nameOfMerchant: invoice.nameOfMerchant,
            productCostPerUnit: invoice.productCostPerUnit.toString(),  // Convert BigInt to string
            quantity: invoice.quantity.toString(),  // Convert BigInt to string
            taxRateInBps: invoice.taxRateInBps.toString(),  // Convert BigInt to string
            discountInBps: invoice.discountInBps.toString(),  // Convert BigInt to string
            gstinOfMerchant: invoice.gstinOfMerchant.toString(),  // Convert BigInt to string
            totalAmountIncludingTax: invoice.totalAmountIncludingTax.toString()  // Convert BigInt to string
        };

        setInvoiceDetails(formattedInvoice);  // Store the formatted invoice details in the state
        console.log('Invoice details:', formattedInvoice);
    } catch (error) {
        setError('Error viewing invoice: ' + error.message);
    }
};


  // Test function to create a sample invoice
  const testInvoice = async () => {
    const testMerchant = "0x11e9890626D6cC378d1c9B845B44e6AA77503e46";
    const testCustomer = "0x7b1C769030Cf2cA442912bEa381a51C043A63e43";
    const testNameOfMerchant = "Test Merchant";
    const testProductCostPerUnit = 1000000;
    const testQuantity = 10;
    const testTaxRateInBps = 10;
    const testDiscountInBps = 0;
    const testGstinOfMerchant = 123456789;

    try {
      const receipt = await createInvoice(
        testMerchant,
        testCustomer,
        testNameOfMerchant,
        testProductCostPerUnit,
        testQuantity,
        testTaxRateInBps,
        testDiscountInBps,
        testGstinOfMerchant
      );
      console.log('Test invoice created successfully:', receipt);
    } catch (error) {
      setError('Test failed: ' + error.message);
    }
  };

  return (
    <div className="App">
      <h1>Zeebu Invoice DApp</h1>

      {/* Create Invoice Section */}
      <div className="form-container">
        <h2>Create Invoice</h2>
        <input placeholder="Merchant" value={merchant} onChange={(e) => setMerchant(e.target.value)} />
        <input placeholder="Customer" value={customer} onChange={(e) => setCustomer(e.target.value)} />
        <input placeholder="Merchant Name" value={nameOfMerchant} onChange={(e) => setNameOfMerchant(e.target.value)} />
        <input placeholder="Product Cost Per Unit" value={productCostPerUnit} onChange={(e) => setProductCostPerUnit(e.target.value)} />
        <input placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <input placeholder="Tax Rate (bps)" value={taxRateInBps} onChange={(e) => setTaxRateInBps(e.target.value)} />
        <input placeholder="Discount (bps)" value={discountInBps} onChange={(e) => setDiscountInBps(e.target.value)} />
        <input placeholder="GSTIN of Merchant" value={gstinOfMerchant} onChange={(e) => setGstinOfMerchant(e.target.value)} />
        <button onClick={createInvoice}>Create Invoice</button>
      </div>

      {/* Pay Invoice Section */}
      <div className="form-container">
        <h2>Pay Invoice</h2>
        <input placeholder="Invoice ID" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} />
        <button onClick={payInvoice}>Pay Invoice</button>
      </div>

      {/* View Invoice Section */}
      <div className="form-container">
        <h2>View Invoice</h2>
        <input placeholder="Invoice ID" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} />
        <button onClick={viewInvoice}>View Invoice</button>
        {invoiceDetails && (
          <div>
            <h3>Invoice Details:</h3>
            <pre>{JSON.stringify(invoiceDetails, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Test Invoice Section */}
      <div className="form-container">
        <h2>Test Invoice</h2>
        <button onClick={testInvoice}>Create Test Invoice</button>
      </div>

      {/* Display Transaction and Error Messages */}
      {transactionHash && (
        <div className="transaction-details">
          <h2>Transaction Hash:</h2>
          <p>{transactionHash}</p>
        </div>
      )}

      {error && (
        <div className="error">
          <h2>Error:</h2>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

export default App;