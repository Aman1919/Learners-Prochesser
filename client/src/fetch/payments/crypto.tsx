import { BACKEND_URL } from "../../constant";
import axios from "axios";
export async function fetchCryptoPayment(type) {
  const token = localStorage.getItem("token");
  const url = `${BACKEND_URL}/api/cryptopayment/get-url`;
  try {
    const response = await axios.post(
      url,
      {
        name: type,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = response.data;
    if (!data.paymentDetails) {
      console.log(data);
      alert(data.message);
      return;
    } else {
      window.location.href = data.paymentDetails;
    }
  } catch (error) {
    console.error("Error fetching payment URL:", error);
  }
}