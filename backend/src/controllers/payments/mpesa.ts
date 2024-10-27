import prisma from "../../prismaClient";
import {  generateUniqueId, getFinalAmountInCurrency, isValidEmail, updateTransactionChecks } from "../../utils";
import { FRONTEND_URL, INTASEND_IS_TEST, INTASEND_PUBLISHABLE_KEY, INTASEND_SECRET_KEY, REDIRECT_URL } from "../../constants";
const IntaSend   = require("intasend-node")

 const NODE_ENV = process.env.NODE_ENV ?? "development"


 export const getUrl = async (req: any, res: any) => {
  const {  name } = req.body;
  console.log(req.user);
  const user = req.user;
  const userId = user.id;
  console.log(user,name);
  

  if (!userId || !name) {
    return res.status(400).json({ error: "userId and package name are required." });
  }

  try {
    // Find the package by name
    const packag = await prisma.package.findUnique({
      where: {
         name: name
      },
    });
    
    if (!packag) {
      return res.status(404).json({ error: "Package not found."});
    }
    const subscription = user.subscriptions
  if(subscription&&subscription.length>0){
 return res.status(200).json({message:"Already have this  Active Subscription",subscription,user})
  }
    // Extract necessary information
    const currency = "USD";
    const mode = "mpesa"; 
    const amount =await  getFinalAmountInCurrency(packag.price,currency);

    if (!amount)
      return res
        .status(500)
        .json({ message: "Invalid currency", status: "error" });

    // User details
    const first_name = user?.firstname || "";
    const last_name = user?.lastname || "";
    const email = user?.email || " ";

    // IntaSend payment initialization
    const intasend = new IntaSend(
      INTASEND_PUBLISHABLE_KEY,
      INTASEND_SECRET_KEY,
      INTASEND_IS_TEST
    );

    const collection = intasend.collection();
    const apiRef = generateUniqueId();
    const secretToken = generateUniqueId();

    // Logging for development mode
    console.log("NODE_ENV", NODE_ENV, NODE_ENV === "development");
    if (NODE_ENV === "development") {
      console.log("Secret Token", secretToken, mode, apiRef);
    }

    try {
      // Initiating the charge
    console.log(`${REDIRECT_URL}/${secretToken}/${apiRef}/${mode}`)
      if (!first_name || !last_name || !email || !amount || !FRONTEND_URL) {
        return res.status(400).json({ error: "Missing required payment information" });
      }
      const resp = await collection.charge({
        first_name,
        last_name,
        email,
        host: FRONTEND_URL,
        method: "M-PESA",
        amount,
        currency:'KES',
        api_ref:apiRef,
        redirect_url: `${REDIRECT_URL}/${secretToken}/${apiRef}/${mode}`,
      });

      console.log(resp);
      
      // Store transaction details in the database
      const createRecord = await prisma.transaction.create({
        data: {
          userId: user.id,
          packageId: packag.id,
          amount: amount,
          apiRef,
          currency,
          status: 'PENDING',
          mode,
          secretToken,
          signature: resp.signature,
        checkoutId: resp.id,
        finalAmountInUSD:packag.price
        },
      });

      if (!createRecord) {
        console.error("Something went wrong while creating a transaction");
        return res.status(500).json({
          message: "Something went wrong in adding data to transaction table",
          status: "error",
        });
      }

      // Return payment details
      res.status(200).json({
        message: "Payment request successful",
        paymentDetails: resp.url,
      });
    } catch (error) {
      console.error(`Charge error:`, error);
      if (error instanceof Buffer) {
        console.error("Charge error:", error.toString('utf8'));
      }
      return res.status(500).json({ message: "Invalid Request", status: "error" });
    }
  } catch (error) {
    console.error("Error creating payment URL:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const successFullTransaction = async (req: any, res: any) => {
  try {
    const { secret_token, mode, api_ref } = req.body;

    console.log("NODE_ENV:", process.env.NODE_ENV, "Is Development:", process.env.NODE_ENV === "development");
    if (process.env.NODE_ENV === "development") {
      console.log("Secret Token:", secret_token, "Mode:", mode, "API Ref:", api_ref);
    }

    // Validate required fields
    if (!secret_token || !mode || !api_ref) {
      return res.status(401).json({
        message: "Unauthorized Payment: Missing required parameters.",
      });
    }

    // Retrieve the transaction based on api_ref and mode
    const transaction = await prisma.transaction.findFirst({
      where: {
        apiRef: api_ref,
        mode: mode,
      }
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found", status: "error" });
    }

    // Validate the secret token
    const isValidTransaction = (secret_token===transaction.secretToken);

    if (!isValidTransaction) {
      return res.status(401).json({
        message: "Unauthorized Transaction: Invalid secret token.",
        status: "error",
      });
    }

    // Check the current status of the transaction
    if (transaction.status === "COMPLETED") {
      return res.status(200).json({
        message: "Payment already completed.",
        status: "success",
      });
    }

    if (transaction.status === "CANCELLED") {
      return res.status(401).json({
        message: "Transaction already completed or cancelled.",
        status: "error",
      });
    }

    // Begin a Prisma transaction to ensure atomicity
    const result = await prisma.$transaction(async (prisma: any) => {
      // Update the transaction status to COMPLETED
      const updatedTransaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "COMPLETED" },
      });

      // Check for existing active subscription for the user-package combination
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId: transaction.userId,
          packageId: transaction.packageId,
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
            userId: transaction.userId,
            packageId: transaction.packageId,
            status: 'ACTIVE',
            startDate: startDate,
            endDate: endDate,
          }
        });

        return { updatedTransaction, newSubscription };
      }
    });

    res.status(200).json({
      message: "Payment Successful",
      transaction: result.updatedTransaction,
      subscription: result.updatedSubscription || result.newSubscription,
    });

  } catch (error) {
    console.error("Error recording purchase:", error);
    res.status(500).json({ error: "Failed to record purchase." });
  }
};


export const validateTransaction = async (req:any, res: any) => {
  try {
    const { api_ref, challenge, state } = req.body;
    const INSTASEND_CHALLENGE = 'DEPOSIT'
    console.log(
      "--------------------------------------------------------------------------------Triggering webhook for deposits--------------------------------------------------------------------------------------------"
    );

    console.log(challenge, api_ref, state, INSTASEND_CHALLENGE);

    // Check for challenge and match it
    if (challenge !== INSTASEND_CHALLENGE) {
      console.log("User not authorized");
      return res.status(400).json({
        status: "error",
        message: "User is unauthorized",
      });
    }

    // Check for api_ref and match it
    const transaction = await prisma.transaction.findFirst({
      where: {
       apiRef:api_ref,
      },
      select: {
        id: true,
        userId: true,
        finalAmountInUSD: true,
        status: true,
        secretToken: true,
        packageId: true,
      },
    });

    if (!transaction) {
      console.log("Transaction not found");
      return res
        .status(404)
        .json({ message: "Transaction not found", status: "error" });
    }

    console.log("Transaction for deposit found -> ", transaction);

    try {
      if(state === "FAILED") {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "CANCELLED",
          },
        });

        return res.status(400).json({
          message: `Status is ${state}`,
          status: "error",
        });
      }

      if (state !== "COMPLETE") {
        console.log("Payment is", state);

        return res.status(400).json({
          message: `Status is ${state}`,
          status: "error",
        });
      }

      // Check for if the transaction is pending
      if (transaction.status !== "PENDING") {
        console.log(
          "Transaction already completed with status -> ",
          transaction.status
        );
        return res.status(401).json({
          message: "Transaction already completed or cancelled",
          status: "error",
        });
      }

      const result = await prisma.$transaction(async (prisma: any) => {
      // Update the transaction status to COMPLETED
      const updatedTransaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "COMPLETED" },
      });

      // Check for existing active subscription for the user-package combination
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId: transaction.userId,
          packageId: transaction.packageId,
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
            userId: transaction.userId,
            packageId: transaction.packageId,
            status: 'ACTIVE',
            startDate: startDate,
            endDate: endDate,
          }
        });

        return { updatedTransaction, newSubscription };
      }
    });

      console.log("Payment Completed");
      res.status(200).json({
        message: "Payment Successful",
      });
    } catch (error) {
      console.log("Something went wrong in updating the balances", error);
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "ERROR",
        },
      });
    }
  } catch (error) {
    console.error("Error Validating Deposit:", error);
    res.status(500).json({ message: "Internal server error", status: "error" });
  }
};

export const updateTransaction = async (req: any, res: any) => {
  try {
    const { invoice_id } = req.body;
    try {
      const transactionCheck = await updateTransactionChecks(invoice_id);

      if (!transactionCheck.status) {
        return res.status(400).json({
          status: false,
          message: transactionCheck.message,
        });
      }

      return res.status(200).json({
        message: "Success",
        resp: transactionCheck.message,
      });
    } catch (error) {
      console.log(
        "Something went wrong while fetching the transaction from Instasend",
        error
      );
      res.status(500).json({ message: "Instasend error", status: "error" });
    }
  } catch (error) {
    console.error("Error Fetching Transaction:", error);
    res.status(500).json({ message: "Internal server error", status: "error" });
  }
};
