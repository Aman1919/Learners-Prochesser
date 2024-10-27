import { BACKEND_URL } from "../../constant";
import axios from "axios";

// Interfaces for type definitions
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

interface LoginResponse {
  token: string;
}

interface SignupResponse {
  token: string;
}

interface ForgotPasswordResponse {
  message: string;
}

interface UpdatePasswordResponse {
  message: string;
}

// Utility functions
const handleError = (error: unknown, defaultMessage: string): string => {
  if (axios.isAxiosError(error) && error.response) {
    return error.response.data.message || defaultMessage;
  }
  return defaultMessage;
};

// Login function
export async function fetchLogin(
  email: string,
  password: string,
  setError: (message: string) => void
): Promise<void> {
  const url = `${BACKEND_URL}/api/auth/login`;
  
  if (!email || !password) {
    setError("Please fill out both fields.");
    return;
  }
  setError("");

  try {
    const response = await axios.post<LoginResponse>(url, { email, password });
    const { token } = response.data;
    localStorage.setItem("token", token);
    window.location.href = "/";
  } catch (error) {
    setError(handleError(error, "Invalid email or password."));
    console.error("Sign-in error:", error);
  }
}

// Signup function
export async function fetchSignup(
  formData: FormData,
  setError: (message: string) => void,
  setSuccess: (message: string) => void
): Promise<void> {
  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  try {
    const url = `${BACKEND_URL}/api/auth/signup`;
    const response = await axios.post<SignupResponse>(url, {
      firstname: formData.firstName,
      lastname: formData.lastName,
      email: formData.email,
      password: formData.password,
    });

    const { token } = response.data;
    localStorage.setItem("token", token);
    setSuccess("User registration successful!");
    window.location.href = "/";
  } catch (error) {
    setError(handleError(error, "Failed to register"));
  }
}

// Forgot Password function
export async function fetchForgotPassword(email: string): Promise<void> {
  const url = `${BACKEND_URL}/api/auth/forgotpassword`;

  try {
    const response = await axios.post<ForgotPasswordResponse>(url, { email });
    alert(response.data.message);
  } catch (error) {
    alert(handleError(error, "An error occurred. Please try again."));
    console.error("Forgot password error:", error);
  }
}

// Update Password function
export async function fetchUpdatePassword(
  token: string,
  newPassword: string
): Promise<void> {
  if (!token) {
    alert("URL is not valid");
    return;
  }
  
  const url = `${BACKEND_URL}/api/auth/updateforgotpassword`;

  try {
    const response = await axios.post<UpdatePasswordResponse>(url, {
      token,
      newPassword,
    });

    if (response.status === 200) {
      alert("Password reset successfully");
      window.location.href = "/login";
    } else {
      alert(response.data.message || "An error occurred");
    }
  } catch (error) {
    alert("Failed to reset password");
    console.error("Update password error:", error);
  }
}

// Verify Reset Password Token function
export async function verifyResetPasswordToken(
  token: string,
  setError: (message: string) => void,
  setEmail: (email: string) => void
): Promise<void> {
  const url = `${BACKEND_URL}/api/auth/verifyResetToken/${token}`;

  try {
    const response = await axios.get<{ email: string; message?: string }>(url);

    if (response.status === 200) {
      setEmail(response.data.email);
    } else {
      setError(response.data.message || "Invalid or expired token");
    }
  } catch (error) {
    setError("Failed to verify token");
    console.error("Token verification error:", error);
  }
}
