import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useState, useEffect } from "react";
import { BACKEND_URL } from "../../constant";
import { onApproveCallback } from "./PaymentForm";

const PAYPALCLIENTID = "ASrya6Fyjjmt8by8de3ErkS3fOWynZxK3TLPb1Cw9gkTSPCCNi6O19QE5ZczJ9hmsEofuw41Xt20KZ2D";

const PaypalPage = ({packagName,token}:any) => {
  const [clientToken, setClientToken] = useState(undefined);
  const [message, setMessage] = useState("");
  
  const initialOptions = {
    clientId: PAYPALCLIENTID,
    dataClientToken: clientToken,
  };

  useEffect(() => {
    // Fetch client token on component mount
    (async () => {
      const response = await fetch(`${BACKEND_URL}/api/payments/paypal/token`, {
        method: "POST",
      });
      const { client_token } = await response.json();
      setClientToken(client_token);
    })();
  }, []);

  // // Function to create PayPal order by calling backend
  const createOrderCallback = async () => {
    console.log(token)
    try {

      const response = await fetch(`${BACKEND_URL}/api/payments/paypal/get-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name:packagName }), // Include package or other data as needed
      });

      const data = await response.json();
      console.log(data.url)
      return data.orderId;  // Return approval URL to the PayPal button
    } catch (error) {
      console.error("Error creating order:", error);
      setMessage("Could not create order.");
    }
  };

  // // // Function to handle order approval
  // const onApproveCallback = async (data:any) => {
  //   console.log(data);
  //   try {
  //     setMessage("Payment approved successfully!");
  //     // Additional handling after approval
  //   } catch (error) {
  //     console.error("Payment approval error:", error);
  //     setMessage("Payment approval failed.");
  //   }
  // };

  return (
    <div className="w-full">
      {clientToken ? (
        <PayPalScriptProvider options={initialOptions}>
          <PayPalButtons
            style={{
              shape: "rect",
              layout: "horizontal",
              borderRadius: 7,
              label: "checkout",
              tagline: false,
              height: 40,
            }}
            createOrder={createOrderCallback}
            onApprove={async (data) => setMessage(await onApproveCallback(data,token))}
            onCancel={() => {
              console.log("Payment cancelled");
            }}
            onError={(err) => {
              console.error("Payment error:", err);
            }}
          />
          {message && <p>{message}</p>}
        </PayPalScriptProvider>
      ) : (
        <h4>WAITING ON CLIENT TOKEN</h4>
      )}
    </div>
  );
};

export default PaypalPage;
