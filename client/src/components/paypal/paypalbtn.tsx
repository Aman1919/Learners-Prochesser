import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useState, useEffect } from "react";
import { BACKEND_URL } from "../../constant";
import { onApproveCallback ,createOrderCallback} from "./PaymentForm";

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


  return (
    <div className="w-full">
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
            createOrder={()=> createOrderCallback(token,packagName,setMessage)}
            onApprove={async (data) => {setMessage(await onApproveCallback(data,token))
              window.location.href = "/dashboard"
            }}
            onCancel={() => {
              console.log("Payment cancelled");
            }}
            onError={(err) => {
              alert(err.message || "Something went wrong!!");
              console.error("Payment error:", err);
            }}
          />
          {message && <p>{message}</p>}
        </PayPalScriptProvider>
      
    </div>
  );
};

export default PaypalPage;
