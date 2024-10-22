import express from 'express';
import  {getUrl,successFullTransaction} from '../../controllers/payments/mpesa' ;
import { authenticateJWT } from '../../middlewares/authMiddleware';
const router = express.Router();

router.post('/get-url', authenticateJWT,getUrl);
router.post('/successful-transaction',successFullTransaction);

export default router;
