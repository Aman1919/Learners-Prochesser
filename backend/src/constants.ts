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
export const  PAYPAL_CLIENT_ID=process.env.PAYPAL_CLIENT_ID??"ASrya6Fyjjmt8by8de3ErkS3fOWynZxK3TLPb1Cw9gkTSPCCNi6O19QE5ZczJ9hmsEofuw41Xt20KZ2D"
export const PAYPAL_CLIENT_SECRET=process.env.PAYPAL_SECRET_ID??"EMiim0PjtczURLgy8Mb5VutjjJ-lBMRCYr5rSMds2VeSUxfnBTJkYK3T-8laKAzSL__j6nEY-5WNH9hX"
export const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID ?? "02J3658973138734J"
export const CACHE_DIR = process.env.PAYPAL_CACHE_DIR ?? "."

// NOW Payments related constants
export const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY ?? "H3ZN6VC-QAF43VG-QMBS8CE-X2T4W7S";
export const NOWPAYMENTS_SECRET_KEY = process.env.NOWPAYMENTS_SECRET_KEY ?? "H3ZN6VC-QAF43VG-QMBS8CE-X2T4W7S";
export const NOWPAYMENTS_IPN_KEY = process.env.NOWPAYMENTS_IPN_KEY ?? "El8xDZ5bb1ASI8EmZTJpPZqHUMArANW9";
export const NOWPAYMENTS_API_URL = process.env.NOWPAYMENTS_API_URL ?? "https://api-sandbox.nowpayments.io/v1";
export const NOWPAYMENTS_EMAIL = process.env.NOWPAYMENTS_EMAIL ?? ""
export const NOWPAYMENTS_PASS = process.env.NOWPAYMENTS_PASS ?? ""
export const NOWPAYMENTS_IPN = process.env.NOWPAYMENTS_IPN ?? "7ixO9IKjlk3oAxV1mK7lzT/ptdKHLQna"



export const BINANCE_SECRET_KEY = process.env.BINANCE_SECRET_KEY ?? "hXn4S1uyGS3VLzi3tP58UqGS5YqJr8KqzO7ftlMUhkCJvgONw72Gqljj0nAJcrax";
export const BINANCE_API_KEY = process.env.BINANCE_API_KEY ?? "RfQznQa9bLsWHlP71FUugB5dl5iTAf54EiEaoIB8ZEghS7QmQNWfXaFArYi6GeUB";
export const BACKEND_ROUTE = "api";
export const NODEMAILER_MAIL = process.env.NODEMAILER_MAIL ?? "support@prochesser.com";
export const NODEMAILER_PASS = process.env.NODEMAILER_PASS ?? "20100948$nO";
