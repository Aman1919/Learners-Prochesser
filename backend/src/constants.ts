export const REDIRECT_URL = process.env.FRONTEND_URL
  ? `${process.env.FRONTEND_URL}/payment`
  : "https://5173-aman1919-prochesser-ajd2h3iqw3f.ws-us116.gitpod.io/payment";
export const FRONTEND_URL = process.env.FRONTEND_URL ?? "https://5173-aman1919-prochesser-ajd2h3iqw3f.ws-us116.gitpod.io";

export const INTASEND_PUBLISHABLE_KEY =
  process.env.INTASEND_PUBLISHABLE_KEY ?? "";
export const INTASEND_SECRET_KEY = process.env.INTASEND_SECRET_KEY ?? "";
export const INTASEND_IS_TEST = process.env.INTASEND_IS_TEST ? true : false;
export const CURRENCY_RATE_URL = "https://open.er-api.com/v6/latest";

export const BCRYPT_SECRET_KEY =
  process.env.BCRYPT_SECRET_KEY ??
  "fsudckkncsdkjbvkjbkjsdbvjsdnvjsndjvn483984378hfewuibf2fjBHIYLDUCVHADJSKBHAGFLASHFKJHKKKKKKKKKKKdbhvsdigskdkvjsdkjvbisdvhhh";
export const NODE_ENV = "development";

export const BACKEND_URL = process.env.BACKEND_URL ?? "";

export const PAYPAL_BASE = process.env.PAYPAL_BASE ?? "https://api-m.sandbox.paypal.com"
export const  PAYPAL_CLIENT_ID=process.env.PAYPAL_CLIENT_ID??""
export const PAYPAL_CLIENT_SECRET=process.env.PAYPAL_SECRET_ID??""
export const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID ?? "02J3658973138734J"
export const CACHE_DIR = process.env.PAYPAL_CACHE_DIR ?? "."

export const CRYPTO_DEPOSIT_PERCENT = process.env.CRYPTO_DEPOSIT_PERCENT
  ? Number(process.env.CRYPTO_DEPOSIT_PERCENT)
  : 0.035;
export const CRYPTO_MERCHANT_ID = process.env.CRYPTO_MERCHANT_ID ?? "";
export const CRYPTO_PAYMENT_API_KEY = process.env.CRYPTO_PAYMENT_API_KEY ?? "";
export const CRYPTO_PAYOUT_API_KEY = process.env.CRYPTO_PAYOUT_API_KEY ?? "";
export const CRYTPOMUS_URI =
  process.env.CRYTPOMUS_URI ?? "https://api.cryptomus.com/v1";

export const BINANCE_SECRET_KEY = process.env.BINANCE_SECRET_KEY ?? "";
export const BINANCE_API_KEY = process.env.BINANCE_API_KEY ?? "";
export const BACKEND_ROUTE = "api";
export const NODEMAILER_MAIL = process.env.NODEMAILER_MAIL ?? "";
export const NODEMAILER_PASS = process.env.NODEMAILER_PASS ?? "";
