import axios from 'axios';
import {
  NOWPAYMENTS_API_KEY,
    NOWPAYMENTS_API_URL,
    PAYPAL_BASE,
    PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET,
  } from "../constants";
import prisma from '../prismaClient';
  
  const base = PAYPAL_BASE;
  
  /**
   * Generate an OAuth 2.0 access token for authenticating with PayPal REST APIs.
   * @see https://developer.paypal.com/api/rest/authentication/
   */
  export const generateAccessToken = async () => {
    try {
      if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        throw new Error("MISSING_API_CREDENTIALS");
      }
      const auth = Buffer.from(
        PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET
      ).toString("base64");
      const response = await fetch(`${base}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });
  
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error("Failed to generate Access Token:", error);
    }
  };
  
  /**
 * Generate a client token for rendering the hosted card fields.
 * @see https://developer.paypal.com/docs/checkout/advanced/integrate/#link-integratebackend
 */

export const generateClientToken = async () => {
  const accessToken = await generateAccessToken();
  const url = `${base}/v1/identity/generate-token`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Accept-Language": "en_US",
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
};

export async function handleResponse(response: any) {
  try {
    const jsonResponse = await response.json();
    return {
      jsonResponse,
      httpStatusCode: response.status,
    };
  } catch (err) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
}

export async function updateCryptoTransactionChecks(invoice_id: string) {
  try {
    if (!invoice_id)
      return {
        status: false,
        message: "Invoice ID not provided",
      };

    // Add NOWpayment conditions here
    const response = await axios.get(
      `${NOWPAYMENTS_API_URL}/payment/${invoice_id}`,
      {
        headers: {
          "x-api-key": NOWPAYMENTS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const resp = response.data;

    if (!resp || !resp?.payment_status) {
      return {
        status: false,
        message: "Transaction not found in NOWPayments",
      };
    }

    if (resp.payment_status !== "finished") {
      // Don't update the DB and send a error message
      return {
        status: false,
        message: "Transaction is incomplete in NOWPayments",
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
            platform_charges: true,
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
    await prisma.$transaction([
      //update the transaction
    ]);

    return {
      status: true,
      message: resp,
    };
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: "Internal Server Error",
    };
  }
}