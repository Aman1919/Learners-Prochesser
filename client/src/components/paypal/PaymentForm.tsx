import { BACKEND_URL } from "../../constant";


export async function onApproveCallback(data: any,token:any) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/payments/paypal/complete-order?token=${data.orderID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const orderData = await response.json();

    const transaction =
      orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
      orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
    const errorDetail = orderData?.details?.[0];

    if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
      return "Your payment method was declined. Please try again.";
    } else if (errorDetail || !transaction || transaction.status === "DECLINED") {
      let errorMessage;
      if (transaction) {
        errorMessage = `Transaction ${transaction.status}: ${transaction.id}`;
      } else if (errorDetail) {
        errorMessage = `${errorDetail.description} (${orderData.debug_id})`;
      } else {
        errorMessage = JSON.stringify(orderData);
      }
      throw new Error(errorMessage);
    } else {
      return `Transaction ${transaction.status}: ${transaction.id}. Check console for details.`;
    }
  } catch (error:any) {
    console.log(error)
    return `Transaction could not be processed: ${error.error}`;
  }
}
 // // Function to create PayPal order by calling backend
export const createOrderCallback = async (token:string,packagName:string,setMessage:(arg:string)=>void) => {
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

