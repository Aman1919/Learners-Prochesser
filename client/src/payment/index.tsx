import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL } from "../constant";
import axios from "axios";
import Spinner from "../components/spinner";

export default function Payment() {
  const { secret_token, mode, api_ref } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!secret_token || !mode) {
      console.error(`Secret or Mode Token not found`, secret_token, mode);
      alert("Something went wrong. Please try again.");
      navigate("/account");
      return;
    }
    async function updatePayments() {
      const url = `${BACKEND_URL}/api/payment/successful-transaction`;
      try {
        const response = await axios.post(
          url,
          { secret_token, mode, api_ref },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = response.data;

        if (data) {
          window.location.href="/dashboard";
        }
      } catch (error) {
        console.error(`Error during fetching:`, error);
        alert("Something went wrong. Please try again.");
        navigate("/account");
      }
    }

    updatePayments();
  }, [navigate, secret_token]);

  return <Spinner />;
}