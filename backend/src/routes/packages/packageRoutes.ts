import express from 'express';
import { authenticateJWT } from '../../middlewares/authMiddleware';
import {getPackages,getUserPurchasedPackages} from "../../controllers/package"
const router = express.Router();




router.get('/get-packages', authenticateJWT,getPackages);
router.get('/get-user-packages',authenticateJWT,getUserPurchasedPackages );

export default router;
