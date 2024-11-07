import { BACKEND_ROUTE, BACKEND_URL, BINANCE_API_KEY, BINANCE_SECRET_KEY, CRYPTO_DEPOSIT_PERCENT, CRYPTO_MERCHANT_ID, CRYPTO_PAYMENT_API_KEY, CRYTPOMUS_URI, FRONTEND_URL, NODE_ENV } from "../../constants";
import prisma from "../../prismaClient";
import { cloneDeep } from "lodash";
import { generateSignature, generateUniqueId, getFinalAmountInCurrency } from "../../utils";
import axios from "axios";

//helper function
export async function convertUSDTToCrypto(symbol: string, usdtAmount: number) {
  try {
    // Check the environment and log API keys if in development mode
    console.log("NODE_ENV", NODE_ENV, NODE_ENV === "development");

    if (NODE_ENV === "development")
      console.log("Secret Token", BINANCE_API_KEY, BINANCE_SECRET_KEY);

    // Initialize Binance client
    const Binance = require("binance-api-node").default;
    const client = Binance({
      apiKey: BINANCE_API_KEY,
      apiSecret: BINANCE_SECRET_KEY,
    });

    // Fetch current prices from Binance
    const prices = await client.prices();

    // Symbol example: 'BTCUSDT' for Bitcoin, 'ETHUSDT' for Ethereum
    const cryptoSymbol = `${symbol.toUpperCase()}USDT`; // e.g., 'BTCUSDT' or 'ETHUSDT'

    // Get the current price of the cryptocurrency in terms of USDT
    const cryptoPriceInUSDT = parseFloat(prices[cryptoSymbol]);
   console.log(cryptoPriceInUSDT);
   
    if (!cryptoPriceInUSDT) {
      throw new Error(`Price not available for ${symbol}`);
    }

    // Calculate the equivalent cryptocurrency amount for the given USDT amount
    const cryptoAmount = usdtAmount / cryptoPriceInUSDT;

    console.log(
      `${usdtAmount} USDT is equivalent to ${cryptoAmount.toFixed(8)} ${symbol}`
    );
    return cryptoAmount;
  } catch (error: any) {
    console.error("Error fetching price:", error.message);
  }
}


//helper function
export  function matchTransactions(dbTransactions: any[], transactions: any[]) {
    // Create a copy of transactions array to keep track of used transactions
    const availableTransactions = cloneDeep(transactions); // [...transactions];
  
    // Iterate over each dbTransaction
    dbTransactions.forEach((dbTransaction) => {
      // Find the first matching transaction
      const matchingIndex = availableTransactions.findIndex(
        (transaction) =>
          transaction.address === dbTransaction.wallet_address &&
          transaction.amount === dbTransaction.amount &&
          transaction.coin === dbTransaction.currency
      );
  
      // If a matching transaction is found
      if (matchingIndex !== -1) {
        // Assign the txId to the dbTransaction
        dbTransaction.txId = availableTransactions[matchingIndex].txId;
  
        // Remove the used transaction from the availableTransactions array
        availableTransactions.splice(matchingIndex, 1);
      }
    });
  
    return dbTransactions;
  }




  //Sends a wallet address to the user to make a payment
  export const getId = async (req:any, res: any) => {
  try {
    const { address, packagename, currency } = req.body;
    const user = req.user;
    const mode = "crypto";
console.log(req.body)
    // Validate the incoming data
    if (!address || !packagename || !currency) {
      return res.status(400).json({
        status: "error",
        message: "Please provide address, package name, and currency",
      });
    }

    // Find the package
    const packag = await prisma.package.findUnique({
      where: {
        name: packagename,
      },
    });

    if (!packag) {
      return res.status(404).json({ error: "Package not found." });
    }

    // Check if the user already has an active subscription
    const subscription = user.subscriptions
    if(subscription&&subscription.length>0){
           return res.status(200).json({message:"Already have this  Active Subscription",subscription,user})
    }


    const amount = packag.price;

    // Log secret token in development mode
    if (NODE_ENV === "development") {
      console.log("Secret Token", BINANCE_API_KEY, BINANCE_SECRET_KEY);
    }

    const Binance = require("binance-api-node").default;
    
    const client = Binance({
      apiKey: BINANCE_API_KEY,
      apiSecret: BINANCE_SECRET_KEY,
    });

    // Convert the crypto amount to USD
    const finalAmountInCrypto = await convertUSDTToCrypto(currency, amount);
    
    if (!finalAmountInCrypto) {
      return res.status(500).json({ message: "Invalid currency", status: "error" });
    }

   const transaction= await prisma.transaction.create({
      data: {
        userId:  user.id ,
        packageId: packag.id,
        amount:finalAmountInCrypto,
        status: "PENDING",
        signature: "",
        checkoutId: "",
        mode,
        currency,
        platform_charges: amount * 0.03,
        finalAmountInUSD:amount,
        wallet_address: address,
      },
    });
console.log(transaction);

    // Get the deposit address from Binance
    const depositAddress = await client.depositAddress({
      coin: currency,
    });

    if (!depositAddress?.address) {
      return res.status(500).json({
        message: `Could not retrieve deposit address for ${currency}`,
        status: "error",
      });
    }

    console.log(`Deposit Address for ${currency}: ${depositAddress.address}`);

    res.status(200).json({
      message: "success",
      wallet_address: depositAddress.address,
      amountIncrypto:finalAmountInCrypto
    });
  } catch (error) {
    console.error("Error processing crypto payment:", error);
    res.status(500).json({ message: "Internal server error", status: "error" });
  }
};

export const checkTransactionStatus = async () => {
  try {
    // Get all successful transactions for past 15 mins
    const currentTime = Date.now();
    // Set the start time to 15 minutes ago
    const fifteenMinutesAgo = currentTime - 15 * 60 * 1000;

    if (NODE_ENV === "development")
      console.log("Secret Token", BINANCE_API_KEY, BINANCE_SECRET_KEY);

    const Binance = require("binance-api-node").default;
    const client = Binance({
      apiKey: BINANCE_API_KEY,
      apiSecret: BINANCE_SECRET_KEY,
    });
    const transactions = await client.depositHistory({
      status: 1,
      startTime: fifteenMinutesAgo,
      endTime: currentTime,
    });
    console.log(
      `Success Transactions between ${new Date(
        fifteenMinutesAgo
      )} and ${new Date(currentTime)}`
    );
    console.log(transactions);
    console.log("Transaction Count: ", transactions.length);

    if (!transactions || transactions.length === 0) {
      return;
    }

    const conditions = transactions.map((transaction: any) => {
      return {
        wallet_address: transaction.address,
        amount: transaction.amount,
        mode: "crypto",
        currency: transaction.coin,
        status: "PENDING",
      };
    });

    let dbTransactions = await prisma.transaction.findMany({
      where: {
        OR: conditions,
      },
    });

    if (!dbTransactions || dbTransactions.length === 0) {
      console.log("No pending transactions found in DB");
      return;
    }

    dbTransactions = matchTransactions(dbTransactions, transactions);

    console.log("Combined Transactions", dbTransactions);

    for (let i = 0; i < dbTransactions.length; i++) {
      const dbTransaction = transactions[i];
      console.log(dbTransaction);

      const result = await prisma.$transaction(async (prisma: any) => {
        // Update the transaction status to COMPLETED
        const updatedTransaction = await prisma.transaction.update({
          where: { id: dbTransaction.id },
          data: { status: "COMPLETED" },
        });
  
        // Check for existing active subscription for the user-package combination
        const existingSubscription = await prisma.subscription.findFirst({
          where: {
            userId: dbTransaction.userId,
            packageId: dbTransaction.packageId,
            status: 'ACTIVE',
          }
        });
  
        if (existingSubscription) {
          // Optionally, extend the existing subscription's endDate
          const currentEndDate = existingSubscription.endDate || new Date();
          const newEndDate = new Date(currentEndDate);
          newEndDate.setMonth(newEndDate.getMonth() + 1); // Extend by 1 month
  
          const updatedSubscription = await prisma.subscription.update({
            where: { id: existingSubscription.id },
            data: {
              endDate: newEndDate,
            }
          });
  
          return { updatedTransaction, updatedSubscription };
        } else {
          // Create a new subscription
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1); // Set endDate to 1 month from now
  
          const newSubscription = await prisma.subscription.create({
            data: {
              userId: dbTransaction.userId,
              packageId: dbTransaction.packageId,
              status: 'ACTIVE',
              startDate: startDate,
              endDate: endDate,
            }
          });
  
          return { updatedTransaction, newSubscription };
        }
      });

      console.log("Transaction for ", dbTransaction, "updated");
      console.log(
        "Balance updated for User -> ",
        dbTransaction?.userId,
        "with $",
        dbTransaction?.finalamountInUSD
      );
    }
  } catch (error) {
    console.error("Currency conversion error:", error);
    throw new Error("Unable to convert currency.");
  }
};