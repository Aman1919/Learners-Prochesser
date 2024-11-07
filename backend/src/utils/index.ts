import axios from 'axios';
import crypto,{ randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { BCRYPT_SECRET_KEY, CURRENCY_RATE_URL, INTASEND_PUBLISHABLE_KEY,  INTASEND_IS_TEST, INTASEND_SECRET_KEY } from '../constants';
import bcrypt from "bcrypt";
import prisma from '../prismaClient';
const JWT_SECRET = process.env.JWT_SECRET?? "SECRET_KEY"

export const verifyToken = (token: string) => {
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded;
};

export const generateToken = (obj: Object, expiresIn: string = "10h") => {
    const token = jwt.sign(obj, JWT_SECRET, {
      expiresIn,
    });
    return token;
  };
  
  export function generateUniqueId(): string {
    return randomUUID();
  }
  
  export function isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  
export async function getFinalAmountInCurrency(amount: number, currency: string) {
  let rates: any = {};
  try {
    const response = await axios.get(`${CURRENCY_RATE_URL}/KES`);
    rates = response.data;
  } catch (error) {
    console.log("Error fetching currency rates", error);
    return amount;
  }

  if (!rates || !rates?.rates || !rates?.rates?.[currency]) {
    console.log(
      `Currency "${currency}" not found in ->`,
      rates,
      rates?.rates,
      rates?.rates?.[currency]
    );
    return false;
  }

  return parseFloat((amount / rates.rates[currency]).toFixed(2));
}

export async function compareHash(password: string, storedHash: string): Promise<boolean> {
  const passwordWithSecret = password + BCRYPT_SECRET_KEY;

  try {
    const isMatch = await bcrypt.compare(passwordWithSecret, storedHash);
    console.log("IS Matching", isMatch)

    return isMatch;
  } catch (error) {
    console.error('Error comparing hash');
    return false;
  }
}

export const generateSignature = (data: string) => {
  return crypto.createHash("md5").update(data).digest("hex");
};

export async function updateTransactionChecks(invoice_id: string) {
  try {
    if(!invoice_id) return {
      status: false,
      message: "Invoice ID not provided"
    }
    const IntaSend = require("intasend-node");

    let intasend = new IntaSend(
      INTASEND_PUBLISHABLE_KEY,
      INTASEND_SECRET_KEY,
      INTASEND_IS_TEST
    );

    let collection = intasend.collection();
    let resp = await collection.status(invoice_id);

    if (!resp || !resp?.invoice?.state) {
      return {
        status: false,
        message: "Transaction not found in Instasend",
      };
    }

    if (resp.invoice.state !== "COMPLETE") {
      // Don't update the DB and send a error message
      return {
        status: false,
        message: "Transaction is imcomplete in instasend",
      };
    }

    // If it is complete
    // Check in DB if the status is PENDING
    const transaction = await prisma.webhook.findFirst({
      where: {
        invoice_id,
      },
      select: {
        invoice_id: true,
        transaction: {
          select: {
            apiRef: true,
            status: true,
            userId: true,
            finalAmountInUSD: true,
            id: true,
            packageId: true,
          },
        },
      },
    });

    if (!transaction || !transaction.transaction) {
      return {
        status: false,
        message: "Transaction not found",
      };
    }

    // If status not pending return error
    if (
      !transaction.transaction.status ||
      transaction.transaction.status !== "PENDING"
    ) {
      return {
        status: false,
        message: "Transaction already completed or cancelled",
      };
    }

    // Update transaction it as successful
  await prisma.$transaction(async (prisma: any) => {
      // Update the transaction status to COMPLETED
      const updatedTransaction = await prisma.transaction.update({
        where: { id: transaction.invoice_id },
        data: { status: "COMPLETED" },
      });

      // Check for existing active subscription for the user-package combination
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId: transaction.transaction?.userId,
          packageId: transaction.transaction?.packageId,
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
            userId: transaction.transaction?.userId,
            packageId: transaction.transaction?.packageId,
            status: 'ACTIVE',
            startDate: startDate,
            endDate: endDate,
          }
        });

        // return { updatedTransaction, newSubscription };
      }
    });

    return {
      status: true,
      message: resp
    };
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: "Internal Server Error",
    };
  }
}