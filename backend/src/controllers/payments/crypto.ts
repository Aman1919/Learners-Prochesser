import { BACKEND_ROUTE, BACKEND_URL, BINANCE_API_KEY, BINANCE_SECRET_KEY, NODE_ENV, NOWPAYMENTS_API_KEY, NOWPAYMENTS_API_URL, NOWPAYMENTS_IPN_KEY } from "../../constants";
import prisma from "../../prismaClient";
import axios from "axios";
import crypto from "crypto"
import { processWebhook } from "../../webhook/crypto";




  export const createPaymentUrl = async (coin: string, amount: number,packag:string) => {
    const paymentData = {
      price_amount: amount,
      price_currency: "usd", // Adjust as needed
      pay_currency: coin,
      order_id: `order_${Date.now()}`,
      ipn_callback_url: `${BACKEND_URL}/api/cryptopayment/validate/transaction`,
    order_description: packag + "Chess Package"
    };
  
    console.log(NOWPAYMENTS_API_KEY, NOWPAYMENTS_API_URL, paymentData);
  
    const response = await axios.post(
      `${NOWPAYMENTS_API_URL}/invoice`,
      paymentData,
      {
        headers: {
          "x-api-key": NOWPAYMENTS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
  
    return response.data;
  };
  
  export const getNOWPaymentsURL = async (req:any, res: any) => {
    try {
      const { packagename, currency } = req.body;
    const user = req.user;
    const mode = "crypto";
console.log(req.body)
    // Validate the incoming data
    if ( !packagename || !currency) {
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

      try {
        const resp = await createPaymentUrl(currency, amount,packag.name);
       
            
        const createRecord = await prisma.transaction.create({
      data: {
        userId:  user.id ,
        packageId: packag.id,
        amount:amount,
        status: "PENDING",
        signature: resp.token_id,
        checkoutId: resp.id,
        apiRef: resp.order_id,
        mode,
        currency,
        finalAmountInUSD:amount,
      },
    });

  
        if (!createRecord) {
          console.error("Something went wrong while creating a transaction");
          return res.status(500).json({
            message: "Something went wrong in adding data to transaction table",
            status: "error",
          });
        }
  
        res.json({
          message: "Payment request successful",
          paymentDetails: resp.invoice_url,
          resp,
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to create payment" });
      }
    } catch (error) {
      console.error("Error Sending Crypto Payment URL:", error);
      res.status(500).json({ message: "Internal server error", status: "error" });
    }
  };

  function sortObject(obj: any) {
    return Object.keys(obj)
      .sort()
      .reduce((result: any, key) => {
        result[key] =
          obj[key] && typeof obj[key] === "object"
            ? sortObject(obj[key])
            : obj[key];
        return result;
      }, {});
  }

  export const verifySignature = (payload: any, signature: string): boolean => {
    const payloadString = JSON.stringify(sortObject(payload));
    const hmac = crypto.createHmac("sha512", NOWPAYMENTS_IPN_KEY);
    hmac.update(payloadString);
    const calculatedSignature = hmac.digest("hex");
    console.log(
      "Signature calculations",
      NOWPAYMENTS_IPN_KEY,
      calculatedSignature,
      signature,
      calculatedSignature === signature
    );
    return calculatedSignature === signature;
  };
  

  export const addWebhook = async (req: any, res:any) => {
    try {
      // Verify signature before adding the process to queue
      const signature = req.headers["x-nowpayments-sig"] as string;
      const body = req.body;
  
      if (!verifySignature(body, signature)) {
        console.log(
          "Webhook addition Failed: Invalid signature",
          body,
          signature
        );
        return res.status(401).json({ error: "Invalid signature" });
      }
  
      const fullUrl = "https" + "://" + req.get("host") + req.originalUrl;
      // const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
      console.log("Building the full URL", fullUrl);
  
      const webhookData = {
        url: `${fullUrl}/webhook`, // Webhook target URL
        payload: req.body, // Data from the request body
      };
  
      await processWebhook(webhookData);
  
      res.status(200).json({
        status: "success",
        message: "Webhook added successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Webhook handling failed" });
    }
  };

  export const validateTransaction = async (req: any, res: any) => {
    try {
      const { payment_status, invoice_id, order_id } = req.body;
      // Invoice_id is checkout_id in DB
      // order_id is api_ref in DB
  
      console.log(
        "--------------------------------------------------------------------------------Triggering webhook for crypto deposits --------------------------------------------------------------------------------------------"
      );
      console.log(payment_status, invoice_id, order_id);
  
      // Check for api_ref and match it
      const transaction = await prisma.transaction.findFirst({
        where: {
          apiRef: order_id,
          checkoutId: String(invoice_id),
        },
        select: {
          id: true,
          userId: true,
          finalAmountInUSD: true,
          status: true,
          platform_charges: true,
          secretToken: true,
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
        if (payment_status === "failed") {
          console.log(
            "Updating DB..",
            "Transaction",
            transaction.id,
            "has been CANCELLED"
          );
  
          await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
              status: "CANCELLED",
            },
          });
  
          return res.status(400).json({
            message: `Status is ${payment_status}`,
            status: "error",
          });
        }
  
        if (payment_status !== "finished") {
          console.log("Payment is", payment_status);
  
          return res.status(400).json({
            message: `Status is ${payment_status}`,
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
  
        // Update transaction it as successful
        console.log(
          "Updating DB and balance by",
          transaction.finalAmountInUSD,
          "Transaction",
          transaction.id,
          "has been COMPLETED"
        );
        // await prisma.$transaction([
          
        // ]);
  
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
      console.log(error);
      res.status(500).json({ error: "Webhook handling failed" });
    }
  };
  