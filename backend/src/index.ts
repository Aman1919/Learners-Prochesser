import express,{Request,Response} from 'express';
import authRoutes from './routes/auth/authRoutes';
import paymentRouter from "./routes/payments/mpesapaymentRoutes"
import packagesRouter from "./routes/packages/packageRoutes"
import cryptoPaymentRouter from "./routes/payments/crypto";
import { BACKEND_ROUTE } from './constants';
import cors from "cors";
// import { checkTransactionStatus } from './controllers/payments/crypto';
import {connect} from "./redis"
const cron = require('node-cron');
const app = express();
const PORT  = process.env.PORT
app.use(express.json());
app.use(cors());
connect();
app.get('/',(req:Request,res:Response)=>{
    res.send("hellow")
})

app.use(`/${BACKEND_ROUTE}/cryptopayment`,cryptoPaymentRouter);
app.use(`/${BACKEND_ROUTE}/auth`, authRoutes);
app.use(`/${BACKEND_ROUTE}/payment`,paymentRouter);
app.use(`/${BACKEND_ROUTE}/packag`,packagesRouter);

// cron.schedule('* * * * *', async () => {
//     await checkTransactionStatus();
//   });

app.listen(PORT,()=>console.log(`Listening at port ${PORT}`))