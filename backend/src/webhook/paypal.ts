import prisma from "../prismaClient";
import axios from "axios";
import { PAYPAL_BASE, WEBHOOK_ID } from "../constants";
import { generateAccessToken } from "../utils/payment";

export const handlePayPalWebhook = async (req: any, res: any) => {
    try {
        const body = JSON.stringify(req.body);
        console.log("<----------------Triggering Webhooks---------------->");

        // Verify the webhook signature
        const signature = req.headers["paypal-transmission-sig"];
        const transmissionId = req.headers["paypal-transmission-id"];
        const transmissionTime = req.headers["paypal-transmission-time"];
        const webhookId = WEBHOOK_ID;

        if (!signature || !transmissionId || !transmissionTime || !webhookId) {
            return res.status(400).send({ error: "Missing PayPal headers" });
        }

        // Verify the signature with PayPal API
        const verificationResponse = await axios.post(
            `${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`,
            {
                auth_algo: req.headers["paypal-auth-algo"],
                cert_url: req.headers["paypal-cert-url"],
                transmission_id: transmissionId,
                transmission_sig: signature,
                transmission_time: transmissionTime,
                webhook_id: webhookId,
                webhook_event: req.body,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${await generateAccessToken()}`,
                },
            }
        );

    
        if (verificationResponse.data.verification_status !== "SUCCESS") {
            console.log("not success")
            return res.status(400).send({ error: "Invalid PayPal webhook signature" });
        }
      console.log(verificationResponse);
        const event = req.body;

        if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
            const capture = event.resource;
            const orderId = capture.supplementary_data.related_ids.order_id;

            // Update the transaction status in your database
          await prisma.$transaction(async()=>{
            const transaction = await prisma.transaction.update({
                where: { apiRef: orderId },
                data: { status: "COMPLETED" },
            });

            // Extend or create the subscription
            const subscription = await prisma.subscription.findFirst({
                where: {
                    userId: transaction.userId,
                    packageId: transaction.packageId,
                    status: "ACTIVE",
                },
            });

            if (subscription) {
                const extendedEndDate = new Date(subscription.endDate);
                extendedEndDate.setMonth(extendedEndDate.getMonth() + 1);

                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: { endDate: extendedEndDate },
                });
            } else {
                const newEndDate = new Date();
                newEndDate.setMonth(newEndDate.getMonth() + 1);

                await prisma.subscription.create({
                    data: {
                        userId: transaction.userId,
                        packageId: transaction.packageId,
                        status: "ACTIVE",
                        startDate: new Date(),
                        endDate: newEndDate,
                    },
                });
            }

          })
            return res.status(200).send({ message: "Webhook handled successfully" });
        } else if (event.event_type === "PAYMENT.CAPTURE.DENIED" || event.event_type === "PAYMENT.CAPTURE.REFUNDED") {
            const capture = event.resource;
            const orderId = capture.supplementary_data.related_ids.order_id;

            // Update the transaction status in your database
            await prisma.transaction.update({
                where: { apiRef: orderId },
                data: { status: "CANCELLED" },
            });

            return res.status(200).send({ message: "Payment canceled and transaction updated" });
        }

     return  res.status(200).send({ message: "Event type not handled" });
    } catch (error: any) {
        console.error("Error handling PayPal webhook:", error);
        res.status(500).send({ error: "Webhook handling failed" });
    }
};
