import { BACKEND_URL } from "../../constant";
import axios from "axios";

// Define response type
interface IntaSendUrlResponse {
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

// Fetch IntaSend payment URL
export async function getIntaSendUrl(type: string): Promise<void> {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("No authentication token found.");
    return;
  }

  const url = `${BACKEND_URL}/api/payment/get-url`;

  try {
    const response = await axios.post<IntaSendUrlResponse>(
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
