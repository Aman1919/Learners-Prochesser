import { useState } from "react";
import { BACKEND_URL } from "../../constant";
import { getIntaSendUrl } from "../../fetch/payments/index";
import axios from "axios";
import PaypalButton from "./paypal/paypalbtn";

interface Package {
  name: string;
  price: string;
  description: string;
  type: string;
  popularLabel?: string;
  recommendedLabel?: string;
  cta: string;
}

interface User {
  id: number;
  email: string;
}

type PaymentPopupProps = {
  packag: Package;
  user: User | null;
};

export default function PaymentPopup({ packag, user }: PaymentPopupProps) {
  const token = localStorage.getItem("token");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [clickCryptoMethod, setClickCryptoMethod] = useState<boolean>(false);
  const [currency, setCurrency] = useState<string>("BTC");
  const [amountIncrypto, setAmountIncrypto] = useState<string>("");

  if (!user || !token) {
    return null;
  }

  // Function to handle IntaSend payment method
  const IntasendPayment = async () => {
    setClickCryptoMethod(false);
    if(!paymentMethod)return;
    await getIntaSendUrl(packag.type);
  };

  // Function to handle Crypto deposit
  const handleCryptoDeposit = async () => {

    const url = `${BACKEND_URL}/api/cryptopayment/get-wallet-address`;
    try {
      const response = await axios.post(
        url,
        {
          currency,
          packagename: packag.type,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
     console.log(data);
     window.location.href = data.paymentDetails
    } catch (error) {
      console.error("Error during Deposit:", error);
      alert(error ?? "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto p-4">
      <section className="bg-gray-900 rounded-lg shadow-lg">
        <header className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">
            {`${packag.name} - ${packag.price}`}
          </h3>
        </header>

        <div className="p-6 space-y-4">
          {/* Payment Method Selection */}
          <div className="flex justify-between gap-3">
            <select
              className="w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-white rounded-md shadow-md focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              onChange={(e) => setPaymentMethod(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>
                Select Payment Method
              </option>
              <option value="Card">Card</option>
              <option value="ApplePay">Apple Pay</option>
              <option value="GooglePay">Google Pay</option>
              <option value="MPesa">M-Pesa</option>
            </select>

            {paymentMethod&&<button
              className="w-full px-6 py-2 text-sm font-semibold text-white bg-yellow-600 rounded-md hover:bg-yellow-700 transition duration-300 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              onClick={IntasendPayment}
            >
              Pay with {paymentMethod || "Selected Method"}
            </button>}
          </div>

          {/* PayPal Button */}
          <PaypalButton packagName={packag.type} token={token} />

          {/* Crypto Payment */}
          <div className="flex gap-3 justify-between">

          <button
            onClick={handleCryptoDeposit}
            className="px-4 w-full py-2 text-sm font-semibold text-black bg-yellow-500 rounded-md hover:bg-yellow-600 transition duration-300"
            >
            Pay with Crypto
          </button>
                <select
                  className=" px-4 py-2 text-sm font-bold text-gray-700 bg-white rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  name="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                </select>

            </div>
{/* 
          Crypto Payment Details
          {clickCryptoMethod && walletAddress && (
            <div className="mt-5 space-y-3">
              <p className="text-white">
                Wallet Address: <span className="font-semibold">{walletAddress}</span>
              </p>
              <p className="text-red-500">
                Kindly send <span className="font-semibold">{amountIncrypto + " " + currency}</span> to the above address.
              </p>
              <p className="text-red-500">
                Ensure the wallet address and currency match. Your balance will be updated within 10-15 minutes.
              </p>
            </div>
          )} */}
        </div>
      </section>
    </div>
  );
}
