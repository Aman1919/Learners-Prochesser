import prisma from "../../prismaClient";
import { verifyToken, generateToken } from "../../utils";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { SendForgotPassword } from "../../verify";

export const verifyPasswordToken = async (req: any, res: any) => {
  console.log("verify");

  try {
    const decoded = verifyToken(req.params.token) as {
      data: string;
    };

    const user = await prisma.user.findFirst({
      where: {
        email: decoded.data,
      },
    });

    if (!user) {
      console.log("not verified successfully");

      return res
        .status(404)
        .json({ message: "User not found or invalid token" });
    }
    const date = new Date().toISOString();
    await prisma.user.update({
      where: { email: user.email },
      data: { emailVerified: date },
    });
    console.log("verified successfully");

    res.json({ message: "Verified" });
  } catch (error) {
    console.error("Error verifying token:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    return res
      .status(500)
      .json({ message: "An error occurred while verifying the email" });
  }
};

export async function ForgotPassword(req: any, res: any) {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const token = generateToken({ id: user.id, email: user.email });
    await prisma.user.update({
      where: { email },
      data: {
        otp: token,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      },
    });

    await SendForgotPassword(email, token);
    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (e) {
    return res.status(500).json({
      message: "Something went wrong",
      e,
    });
  }
}

export const resetPassword = async (req: any, res: any) => {
  try {
    const { token, newPassword } = req.body;

    // Verify the token
    let decoded;
    try {
      decoded = verifyToken(token) as {
        id: string;
        data: string;
      };
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Find the user by the decoded token ID and token
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.id,
        otp: token,
        otpExpiresAt: {
          gte: new Date(), // Check if the token is still valid
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password and clear the reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashPassword,
        otp: null,
        otpExpiresAt: null,
      },
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyResetToken = async (req: any, res: any) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    console.log(token);
    let decoded;
    try {
      decoded = verifyToken(token) as {
        id: string;
        data: string;
      };
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (!decoded || !decoded.id) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Check if the token matches and has not expired
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.id,
        otp: token,
        otpExpiresAt: {
          gte: new Date(), // Ensure the token is still valid
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Token is valid
    res.status(200).json({ message: "Token is valid", email: user.email });
  } catch (error) {
    console.error("Error verifying reset token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

