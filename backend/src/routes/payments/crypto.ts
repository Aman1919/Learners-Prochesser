
import express from "express";
const router = express.Router();
import {
  getId
} from '../../controllers/payments/crypto';
import  {authenticateJWT} from "../../middlewares/authMiddleware";


router.post("/get-wallet-address", authenticateJWT,getId);

export default router;