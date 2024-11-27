
import express from "express";
const router = express.Router();
import {
  addWebhook,
  getNOWPaymentsURL,
  validateTransaction
} from '../../controllers/payments/crypto';
import  {authenticateJWT} from "../../middlewares/authMiddleware";


router.post("/get-wallet-address", authenticateJWT,getNOWPaymentsURL);
router.post("validate/transaction",addWebhook);
router.post("/validate/transaction/webhook", validateTransaction);

export default router;