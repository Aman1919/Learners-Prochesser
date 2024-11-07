import axios from 'axios';
import {
    PAYPAL_BASE,
    PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET,
  } from "../constants";
  
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