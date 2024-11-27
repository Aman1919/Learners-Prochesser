import express from 'express';
import  {getUrl,successFullTransaction, validateTransaction} from '../../controllers/payments/mpesa' ;
import { authenticateJWT } from '../../middlewares/authMiddleware';
import { addWebhookToQueue } from '../../webhook/mpesa';
const router = express.Router();

router.post('/get-url', authenticateJWT,getUrl);
router.post('/successful-transaction',successFullTransaction);

router.post("/validate/transaction/webhook", validateTransaction);
// TODO: Function is same for below routes. Can be written nicely
router.post("/validate/transaction", async (req:any, res:any) => {
    try {
      const fullUrl = "https" + "://" + req.get("host") + req.originalUrl;
      console.log("Building the full URL", fullUrl);
   console.log('kjnlknlk validate webhook')
      const webhookData = {
        url: `${fullUrl}/webhook`, // Webhook target URL
        payload: req.body, // Data from the request body
      };
  
      // Add the incoming request to the queue for processing
      addWebhookToQueue(webhookData);
  
      // Send an immediate success response
      res.status(200).json({
        status: "success",
        message: "Webhook added successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "error",
        message: "Webhook addition failed",
      });
    }
  });


export default router;
