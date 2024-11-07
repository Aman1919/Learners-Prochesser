import { generateAccessToken, generateClientToken } from "../../utils/payment";
import { PAYPAL_BASE ,PAYPAL_CLIENT_ID,PAYPAL_CLIENT_SECRET} from "../../constants";
import paypal from "paypal-rest-sdk";
import axios from "axios";
import prisma from "../../prismaClient";
import path from "path";
paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id: PAYPAL_CLIENT_ID,
    client_secret: PAYPAL_CLIENT_SECRET,
});

export async function createOrder(req: any, res: any) {
    try {
        const { name } = req.body;
        const user = req.user;
        const userId = user.id;
        
        if (!userId || !name) {
            return res.status(400).json({ error: "userId and package name are required." });
        }

        const packag = await prisma.package.findUnique({
            where: {
                name: name,
            },
        });

        if (!packag) {
            return res.status(404).json({ error: "Package not found." });
        }

        const subscription = user.subscriptions;
        if (subscription && subscription.length > 0) {
            return res.status(200).json({
                message: "Already have this Active Subscription",
                subscription,
                user,
            });
        }

        const accessToken = await generateAccessToken();

        const response = await axios({
            url: `${PAYPAL_BASE}/v2/checkout/orders`,
            method: "post",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            data: {
                intent: "CAPTURE",
                userId: userId,
                purchase_units: [
                    {
                        items: [
                            {
                                name: packag.name,
                                description: packag.name + " Chess Package",
                                quantity: "1",
                                unit_amount: {
                                    currency_code: "USD",
                                    value: packag.price,
                                },
                            },
                        ],
                        amount: {
                            currency_code: "USD",
                            value: packag.price,
                            breakdown: {
                                item_total: {
                                    currency_code: "USD",
                                    value: packag.price,
                                },
                            },
                        },
                    },
                ],
                application_context: {
                    return_url: `${PAYPAL_BASE}/complete-order`,
                    cancel_url: `${PAYPAL_BASE}/cancel-order`,
                    shipping_preference: "NO_SHIPPING",
                    user_action: "PAY_NOW",
                    brand_name: "academy.prochesser.com",
                },
            },
        });

        // Extract order ID from PayPal response
        const orderId = response.data.id;
        
        // Return the approval link to the client
        const approvalUrl = response.data.links.find(
            (link: any) => link.rel === "approve"
        );

        const url = approvalUrl ? approvalUrl.href : null;

        if (url) {
            // Send both the approval URL and the order ID
            return res.status(200).json({ url, orderId });
        } else {
            return res.status(500).json({ error: "Approval URL not found in PayPal response." });
        }
    } catch (error: any) {
        console.error("Error creating PayPal order:", error.message);
        return res.status(500).json({ error: "Could not create order." });
    }
}

export async function completeOrder(req: any, res: any) {
    try {
      // Extract token and payerId from query parameters
      const { token} = req.query;
  
      if (!token) {
        return res.status(400).json({ error: "Token and PayerID are required." });
      }
  
      // Generate access token
      const accessToken = await generateAccessToken();
  
      // Call PayPal API to capture the payment and complete the order
      const response = await axios.post(
        `${PAYPAL_BASE}/v2/checkout/orders/${token}/capture`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      // Check if the payment was successfully captured
      if (response.data.status === "COMPLETED") {
        // Optionally store payment details in the database (e.g., update the user's subscription, etc.)
        // Example: await storePaymentDetails(user.id, response.data);
  
        return res.status(200).json({
          message: "Payment successful!",
          paymentDetails: response.data,
        });
      } else {
        return res.status(500).json({ error: "Payment capture failed." });
      }
    } catch (error: any) {
      console.error("Error completing PayPal order:", error.message);
      return res.status(500).json({ error: "Could not complete payment." });
    }
  }
  

export async function getPaypalSuccess(req: any, res: any) { }

  export const getPaypentPage = async (req: any, res: any) => {
    res.sendFile(path.resolve("./client/index.html"));
  };
  
  // return client token for hosted-fields component
  export const getToken = async (req: any, res: any) => {
    try {
      const { jsonResponse, httpStatusCode } = await generateClientToken();
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error("Failed to generate client token:", error);
      res.status(500).send({ error: "Failed to generate client token." });
    }
  };
  
  export const getOrders = async (req:any, res: any) => {
    try {
      // use the cart information passed from the front-end to calculate the order amount detals
      const { cart } = req.body;

    } catch (error) {
      console.error("Failed to create order:", error);
      res.status(500).json({ error: "Failed to create order." });
    }
  };
  
  export const getOrderStatus = async (req: any, res: any) => {
    try {
      const { orderID } = req.params;
      
    } catch (error) {
      console.error("Failed to create order:", error);
      res.status(500).json({ error: "Failed to capture order." });
    }
  };