import { generateAccessToken, generateClientToken } from "../../utils/payment";
import { PAYPAL_BASE, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } from "../../constants";
import paypal from "paypal-rest-sdk";
import axios from "axios";
import prisma from "../../prismaClient";

paypal.configure({
    mode: "sandbox",
    client_id: PAYPAL_CLIENT_ID,
    client_secret: PAYPAL_CLIENT_SECRET,
});

export async function createOrder(req: 
  any, res: any) {
    try {
        const { name } = req.body;
        const user = req.user;
        
        if (!user?.id || !name) {
            return res.status(400).json({ error: "User ID and package name are required." });
        }

        const packag = await prisma.package.findUnique({ where: { name } });
        if (!packag) {
            return res.status(404).json({ error: "Package not found." });
        }

        const existingSubscription = await prisma.subscription.findFirst({
            where: { userId: user.id, packageId: packag.id, status: "ACTIVE" }
        });
        if (existingSubscription) {
            return res.status(200).json({ message: "Active subscription already exists.", existingSubscription });
        }

        const accessToken = await generateAccessToken();
        const orderResponse = await axios.post(
            `${PAYPAL_BASE}/v2/checkout/orders`,
            {
                intent: "CAPTURE",
                purchase_units: [{
                    items: [{
                        name: packag.name,
                        description: `${packag.name} Chess Package`,
                        quantity: "1",
                        unit_amount: { currency_code: "USD", value: packag.price.toString() }
                    }],
                    amount: {
                        currency_code: "USD",
                        value: packag.price.toString(),
                        breakdown: { item_total: { currency_code: "USD", value: packag.price.toString() } }
                    }
                }],
                application_context: {
                    return_url: `${PAYPAL_BASE}/complete-order`,
                    cancel_url: `${PAYPAL_BASE}/cancel-order`,
                    shipping_preference: "NO_SHIPPING",
                    user_action: "PAY_NOW",
                    brand_name: "academy.prochesser.com"
                }
            },
            {
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` }
            }
        );

        const orderId = orderResponse.data.id;
        await prisma.transaction.create({
            data: {
                userId: user.id,
                packageId: packag.id,
                amount: packag.price,
                apiRef: orderId,
                currency: "USD",
                status: "PENDING",
                signature: "",
                checkoutId: "",
                finalAmountInUSD: packag.price
            }
        });

        const approvalUrl = orderResponse.data.links.find((link: any) => link.rel === "approve")?.href;
        if (approvalUrl) {
            return res.status(200).json({ url: approvalUrl, orderId });
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
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ error: "Token is required." });
        }

        const accessToken = await generateAccessToken();
        const captureResponse = await axios.post(
            `${PAYPAL_BASE}/v2/checkout/orders/${token}/capture`,
            {},
            { headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` } }
        );

        if (captureResponse.data.status === "COMPLETED") {
            const transaction = await prisma.transaction.findUnique({ where: { apiRef: token as string } });
            if (!transaction) {
                return res.status(404).json({ error: "Transaction not found." });
            }

            const result = await prisma.$transaction(async () => {
                const updatedTransaction = await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: { status: "COMPLETED" }
                });

                const existingSubscription = await prisma.subscription.findFirst({
                    where: { userId: transaction.userId, packageId: transaction.packageId, status: "ACTIVE" }
                });

                if (existingSubscription) {
                    const extendedEndDate = new Date(existingSubscription.endDate);
                    extendedEndDate.setMonth(extendedEndDate.getMonth() + 1);

                    const updatedSubscription = await prisma.subscription.update({
                        where: { id: existingSubscription.id },
                        data: { endDate: extendedEndDate }
                    });

                    return { updatedTransaction, updatedSubscription };
                } else {
                    const newEndDate = new Date();
                    newEndDate.setMonth(newEndDate.getMonth() + 1);

                    const newSubscription = await prisma.subscription.create({
                        data: {
                            userId: transaction.userId,
                            packageId: transaction.packageId,
                            status: "ACTIVE",
                            startDate: new Date(),
                            endDate: newEndDate
                        }
                    });

                    return { updatedTransaction, newSubscription };
                }
            });

            return res.status(200).json({ message: "Payment successful!", result });
        } else {
            return res.status(500).json({ error: "Payment capture failed." });
        }
    } catch (error: any) {
        console.error("Error completing PayPal order:", error.message);
        return res.status(500).json({ error: "Could not complete payment." });
    }
}

export const getToken = async (req: any, res: any) => {
  try {
    const { jsonResponse, httpStatusCode } = await generateClientToken();
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to generate client token:", error);
    res.status(500).send({ error: "Failed to generate client token." });
  }
};