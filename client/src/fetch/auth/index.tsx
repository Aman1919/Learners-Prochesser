import { BACKEND_URL } from "../../constant";
import axios from "axios";
export async function fetchLogin(email, password, setError) {
  const url = `${BACKEND_URL}/api/auth/login`;
  if (!email || !password) {
    setError("Please fill out both fields.");
    return;
  }
  setError("");

  try {
    const response = await axios.post(url, {
      email,
      password,
    });

    const token = response.data.token; // Store the token from the response
    console.log(response.data);
    localStorage.setItem("token", token);
    window.location.href = "/";
  } catch (error) {
    setError("Invalid email or password.");
    console.error("Sign-in error:", error);
  }
}

export async function fetchSignup(formData, setError, setSuccess) {
  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  try {
    const url = `${BACKEND_URL}/api/auth/signup`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstname: formData.firstName,
        lastname: formData.lastName,
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to register");
    }

    localStorage.setItem("token", data.token);
    setSuccess("User registration successful!");
    window.location.href = "/";
  } catch (error) {
    setError(error.message);
    alert(error.message || "Some error occured");
  }
}

export async function fetchForgotPassword(email) {
  const url = `${BACKEND_URL}/api/auth/forgotpassword`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Something went wrong");
    }

    const data = await response.json();
    alert(data.message);
    console.log(data);
  } catch (error) {
    alert(error.message || "An error occurred. Please try again.");
    console.error(error);
  }
}

export async function fetchUpdatePassword(token, pass) {
  if (!token) {
    alert("url is not right");
    return;
  }
  const url = `${BACKEND_URL}/api/auth/updateforgotpassword`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword: pass }),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Password reset successfully");
      window.location.href = "/login";
    } else {
      alert(result.message || "An error occurred");
    }
  } catch (err) {
    console.log(err);
    
    alert("Failed to reset password");
  }
}

export async function verifyResetPasswordToken(token, setError, setEmail) {
  console.log(token);

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/auth/verifyResetToken/${token}`,
      {
        method: "GET",
      },
    );

    const result = await response.json();

    console.log(result);
    if (!response.ok) {
      setError(result.message || "Invalid or expired token");
    } else {
      setEmail(result.email);
    }
  } catch (err) {
    console.log("Failed to verify token", err);
  }
}
