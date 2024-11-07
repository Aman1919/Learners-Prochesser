import prisma from "../prismaClient";
import { verifyToken } from "../utils";
import { body } from 'express-validator';

export const validateSignup = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstname').isString().withMessage('Name must be a string'),
  body('lastname').isString().withMessage('Name must be a string'),
];

export const validateLogin = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').exists().withMessage('Password is required'),
];
export const authenticateJWT = async (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader) {
    console.log("no auth header")
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  
  const token = authHeader.split(" ")[1];
  
  try {
    const decoded: any = verifyToken(token);
    console.log(decoded);
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        Subscription: {
          where: {
            status: 'ACTIVE',
            AND: [
          { startDate: { lte: new Date() } }, 
          { endDate: { gt: new Date() } }     
            ]
          }
          , include: {
          package:true
          }
        }
      },
    });
    
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }
    
    req.user = { ...user};
    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};
