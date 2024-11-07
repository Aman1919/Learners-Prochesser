import { useState } from "react";
import { BACKEND_URL } from "../constant";
import { getIntaSendUrl } from "../fetch/payments/index";
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

type PaymentPopupProps ={
  packag: Package;
  user: User | null;
}

export default function PaymentPopup({ packag, user}: PaymentPopupProps) {
  const token = localStorage.getItem('token');

  const [walletAddress, setWalletAddress] = useState<string>("");
  const [inputWalletAddress, setInputWalletAddress] = useState<string>("");
  const [clickCryptoMethod, setClickCryptoMethod] = useState<boolean>(false);
  const [currency, setCurrency] = useState<string>('BTC');
  const [amountIncrypto, setAmountIncrypto] = useState<string>("");

  if (!user || !token) {
    return null;
  }

  // Function to handle IntaSend payment method
  const IntasendPayment = async () => {
    setClickCryptoMethod(false);
    await getIntaSendUrl(packag.type);
  };

  // Function to handle Crypto deposit
  const handleCryptoDeposit = async () => {
    if (!inputWalletAddress) {
      alert("Enter your wallet address");
      return;
    }

    const url = `${BACKEND_URL}/api/cryptopayment/get-wallet-address`;
    try {
      const response = await axios.post(
        url,
        {
          address: inputWalletAddress,
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
      setWalletAddress(data.wallet_address);
      setAmountIncrypto(data.amountIncrypto);
    } catch (error) {
      console.error("Error during Deposit:", error);
      alert(error ?? "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="relative w-full max-w-fit p-4">
      <section className="bg-gray-900 rounded-lg shadow-lg">
        <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-600">
          <h3 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
            {`${packag.name} - ${packag.price}`}
          </h3>
        </header>

        <div className="p-6 flex justify-center items-center flex-col">
          {/* IntaSend Payment Button */}
          <button
            className="px-4 py-2 bg-white mb-2 w-full text-black rounded-md hover:bg-yellow-600 transition-colors"
            onClick={IntasendPayment}
          >
            Pay with IntaSend
          </button>
          <PaypalButton packagName={packag.type} token={token}/>
          {/* Crypto Payment Button */}
          <button
            onClick={() => setClickCryptoMethod(!clickCryptoMethod)}
            className="px-4 py-2 bg-yellow-600 mb-2 w-full text-black rounded-md hover:bg-yellow-700 transition-colors"
          >
            Pay with Crypto
          </button>

          {/* Crypto Method Form */}
          {clickCryptoMethod && (
            <>
              <input
                type="text"
                className="w-full px-4 py-2 rounded bg-white text-black"
                onChange={(e) => setInputWalletAddress(e.target.value)}
                value={inputWalletAddress}
                placeholder="Enter your wallet address"
              />

              <div className="w-full flex items-center justify-between gap-4 p-2 rounded-lg shadow-md">
                <select
                  className="w-[50%] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                </select>

                <button
                  onClick={handleCryptoDeposit}
                  className="bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition duration-300"
                >
                  Send Wallet Address
                </button>
              </div>
            </>
          )}

          {/* Display wallet address and payment instructions */}
          {clickCryptoMethod && walletAddress && (
            <div className="mt-5">
              <p className="text-white">Wallet Address - {walletAddress}</p>
              <p className="text-red-500 mt-3">
                Kindly send {amountIncrypto + " " + currency} to the above address using your wallet.
              </p>
              <p className="text-red-500 mt-3">
                Please make sure the wallet address and the currency matches. Your balance will be updated within 10-15 minutes.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
