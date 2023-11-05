import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const generateJWTToken = (data: any) => {
  const token = jwt.sign(data, process.env.JWT_SECRET as string, {
    expiresIn: "24h",
  });

  return token;
};

export function authenticateJWTToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Authorization token not found!",
    });
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET as string);

  if (!payload) {
    return res.status(400).json({
      success: false,
      message: "User not found!",
    });
  }

  req.user = payload;

  next();
}
