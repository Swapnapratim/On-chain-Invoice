import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ethers } from 'ethers';
import { Wallet, JsonRpcProvider, Contract, BigNumber, AbiCoder } from 'ethers';
import InvoiceFactoryABI from './abi/Invoice.js';
import GasStationABI from './abi/GasStation.js';
import USDTABI from './abi/USDT.js';
import SmartAccountABI from './abi/SmartAccount.js';
import './App.css';

const InvoiceFactoryAddress = ethers.getAddress("0x8DD4f74c9487592e60a18e269eEAbB077049d6f0");
const GasStationAddress = ethers.getAddress("0x7401770d7DcA314332Db3eca9d718A5Bf5219Ad5");
const USDTAddress = ethers.getAddress("0x884ea8fb01727a643cbc9100b7eced0648f15963");
const SmartAccountAddress = ethers.getAddress("0x5282e301214cf0A95CEf8E347764c4Dddd867d62");

// Admin private key
const adminPrivateKey = /*ADD YOUR ADMIN PRIVATE KEY HERE OR IMPORT FROM .env FILE*/;

// Alchemy Optimism Sepolia provider URL
const providerURL = /*ADD YOUR PROVIDER URL HERE OR IMPORT FROM .env FILE*/;

// Create an ethers provider with the Alchemy Optimism Sepolia URL
const provider = new JsonRpcProvider(providerURL, {
  chainId: 11155420,
  name: 'optimism-sepolia',
  ensAddress: null
});

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
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [invoiceCreated, setInvoiceCreated] = useState(false); 
  
  const [isPayingInvoice, setIsPayingInvoice] = useState(false); 
  const [invoicePaid, setInvoicePaid] = useState(false); 


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
      toast.success(`Transaction successful: ${receipt.transactionHash}`);
      console.log('Transaction successful:', receipt.transactionHash);
      return receipt;
    } catch (error) {
      setError('Transaction error: ' + error.message);
      toast.error(`Transaction error: ${error.message}`);
      throw error;
    }
  };

  // Create invoice function
  const createInvoice = async () => {
    setIsCreatingInvoice(true); 
    setInvoiceCreated(false); 
    try {
      const invoiceFactoryContract = new Contract(InvoiceFactoryAddress, InvoiceFactoryABI, wallet);

      const productCostPerUnitInUnits = ethers.parseUnits(productCostPerUnit, 18); // Adjusted due to Mock token decimals, Adust as per needed @dev

      const generateInvoice = {
        merchant,
        customer,
        nameOfMerchant,
        productCostPerUnit: productCostPerUnitInUnits,
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
          setInvoiceId(invoiceId);  
          setInvoiceCreated(true);
          toast.success(`Invoice created successfully with ID: ${invoiceId}`); 
          console.log('Invoice created successfully with ID:', invoiceId);
      } else {
          console.log('InvoiceCreated event not found in the logs');
      }
      return receipt;
    } catch (error) {
      setError('Error creating invoice: ' + error.message);
      toast.error(`Error creating invoice: ${error.message}`);
      throw error;
    } finally {
      setIsCreatingInvoice(false); // Stop loading
    }
  };
  
  const payInvoice = async () => {
    setIsPayingInvoice(true); 
    setInvoicePaid(false);
    try {
        const abiCoder = new AbiCoder();
        console.log("Starting invoice payment process...");

        // Initialize contracts
        const invoiceFactoryContract = new Contract(InvoiceFactoryAddress, InvoiceFactoryABI, wallet);
        const gasStationContract = new Contract(GasStationAddress, GasStationABI, wallet);
        const usdtContract = new Contract(USDTAddress, USDTABI, wallet);
        const smartAccountContract = new Contract(SmartAccountAddress, SmartAccountABI, wallet);

        // Get invoice details
        const invoice = await invoiceFactoryContract.invoices(invoiceId);
        console.log("Retrieved invoice:", invoice);
        const amountToBePaid = invoice.totalAmountIncludingTax;
        console.log("Amount to be paid:", amountToBePaid.toString());

        // Smart Account approves Invoice Factory for USDT transfer
        console.log("Preparing USDT approval for Invoice Factory...");
        const approveData = usdtContract.interface.encodeFunctionData('approve', [
            InvoiceFactoryAddress, 
            amountToBePaid
        ]);

        // Create the execute call for the approval
        const approveCallData = smartAccountContract.interface.encodeFunctionData('execute', [
          USDTAddress,          // target (USDT contract)
          0n,                   // value (0)
          approveData           // data (approve call)
        ]);

        // Prepare the transaction to call sponsorTransaction on GasStation for approval
        console.log("Initiating sponsored approval transaction through GasStation...");
        const sponsorApproveTxData = gasStationContract.interface.encodeFunctionData('sponsorTransaction', [
            SmartAccountAddress,   // target (SmartAccount)
            approveCallData,      // data (wrapped approve call)
            2000000n               // gas limit
        ]);

        const approveTxData = {
            to: GasStationAddress,
            data: sponsorApproveTxData,
            from: wallet.address,  // Set the sender address
        };

        // Send the approval transaction via sendTransaction
        const approveReceipt = await sendTransaction(approveTxData);
        toast.success(`USDT approved for Invoice Factory, transaction submitted: ${approveReceipt.transactionHash}`);
        console.log('USDT approved for Invoice Factory, transaction submitted:', approveReceipt.transactionHash);


        // Prepare the payInvoiceById call
        const payInvoiceData = invoiceFactoryContract.interface.encodeFunctionData('payInvoiceById', [
            invoiceId
        ]);

        // Create the execute call for payInvoiceById
        const wrappedPaymentData = smartAccountContract.interface.encodeFunctionData('execute', [
            InvoiceFactoryAddress,  // target (InvoiceFactory)
            0,                      // value (0)
            payInvoiceData          // data (payInvoiceById call)
        ]);
        
        // Prepare the transaction to call sponsorTransaction on GasStation
        console.log("Initiating sponsored payment transaction through GasStation...");
        const sponsorTxData = gasStationContract.interface.encodeFunctionData('sponsorTransaction', [
            SmartAccountAddress,   // target (SmartAccount)
            wrappedPaymentData,    // data (wrapped call data)
            2000000n               // gas limit
        ]);

        const txData = {
            to: GasStationAddress,
            data: sponsorTxData,
            from: wallet.address,  // Set the sender address
        };

        // Send the transaction via sendTransaction
        const receipt = await sendTransaction(txData);
        setInvoicePaid(true);
        toast.success(`Invoice Payment Successful: ${receipt.hash}`);
        toast.error(`Error paying invoice: ${error.message}`);
        console.log('Transaction submitted:', receipt.hash);
        // NOTE: No need to wait for the receipt here, as receipt.wait() already done in sendTransaction

        // Update UI
        setTransactionHash(receipt.hash);
      } catch (error) {
          console.error('Payment error:', error);
          setError(`Error paying invoice: ${error.message}`);
          throw error;
      } finally {
        setIsPayingInvoice(false); // Stop loading
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
            productCostPerUnit: invoice.productCostPerUnit.toString(),  
            quantity: invoice.quantity.toString(),  
            taxRateInBps: invoice.taxRateInBps.toString(), 
            discountInBps: invoice.discountInBps.toString(), 
            gstinOfMerchant: invoice.gstinOfMerchant.toString(),  
            totalAmountIncludingTax: invoice.totalAmountIncludingTax.toString()  
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
      <h1>ZeebuPay</h1>
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
        <button
          onClick={createInvoice}
          disabled={isCreatingInvoice}  
          style={{
            backgroundColor: invoiceCreated ? 'green' : '',
            cursor: isCreatingInvoice ? 'not-allowed' : 'pointer',
          }}
        >
          {isCreatingInvoice ? 'Creating Invoice...' : invoiceCreated ? 'Invoice Created!' : 'Create Invoice'}
        </button>
      </div>

      {/* Pay Invoice Section */}
      <div className="form-container">
        <h2>Pay Invoice</h2>
        <input placeholder="Invoice ID" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} />
        <button
          onClick={payInvoice}
          disabled={isPayingInvoice}  
          style={{
            backgroundColor: invoicePaid ? 'green' : '',
            cursor: isPayingInvoice ? 'not-allowed' : 'pointer',
          }}
        >
          {isPayingInvoice ? 'Paying Invoice...' : invoicePaid ? `Invoice #${invoiceId} Paid!` : 'Pay Invoice'}
        </button>
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
        <h2>Test Invoice Creation With Script Params</h2>
        <button onClick={testInvoice}>Create Invoice</button>
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