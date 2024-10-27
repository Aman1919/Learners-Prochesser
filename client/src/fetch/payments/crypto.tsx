import { BACKEND_URL } from "../../constant";
import axios from "axios";

// Define the expected response structure
interface CryptoPaymentResponse {
  paymentDetails?: string;
  message?: string;
}

// Utility function for error handling
const handleError = (error: unknown, defaultMessage: string): string => {
  if (axios.isAxiosError(error) && error.response) {
    return error.response.data.message || defaultMessage;
  }
  return defaultMessage;
};

// Fetch crypto payment URL
export async function fetchCryptoPayment(type: string): Promise<void> {
  const token = localStorage.getItem("token");
  
  if (!token) {
    console.error("No authentication token found.");
    return;
  }

  const url = `${BACKEND_URL}/api/cryptopayment/get-url`;

  try {
    const response = await axios.post<CryptoPaymentResponse>(
      url,
      { name: type },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response.data;

    if (data.paymentDetails) {
      window.location.href = data.paymentDetails;
    } else {
      console.log(data);
      alert(data.message || "Unexpected error occurred.");
    }
  } catch (error) {
    console.error("Error fetching payment URL:", error);
    alert(handleError(error, "Failed to retrieve payment URL."));
  }
}
