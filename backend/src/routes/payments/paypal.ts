import express from "express";
import { authenticateJWT } from "../../middlewares/authMiddleware";
import { getToken, createOrder, completeOrder } from "../../controllers/payments/paypal";

const router = express.Router();

router.post("/get-url", authenticateJWT,createOrder);
router.post("/token", getToken);
router.post("/complete-order",completeOrder);

export default router;