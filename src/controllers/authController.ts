import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/prisma";
import { generateJWTToken } from "../middlewares/jwt";

const googleAuth = async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    return res.status(400).json({
      success: false,
      message: "Request method is not allowed!",
    });
  }

  const { token }: { token: string } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Request body is missing!",
    });
  }

  const currentDate = new Date();

  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID as string);

    const userClient = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID as string,
    });

    const userPayload = userClient.getPayload();

    if (!userPayload?.name || !userPayload?.email) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }

    const organization = await prisma.organization.findFirst({
      where: {
        domain: userPayload.email.split("@")[1],
        isActive: true,
      },
    });

    if (!organization) {
      return res.status(400).json({
        success: false,
        message: "Organization not found!",
      });
    }

    const user = await prisma.user.upsert({
      create: {
        organizationId: organization.id,
        username: userPayload.name,
        email: userPayload.email,
        picture: userPayload.picture,
        lastLogin: currentDate,
      },
      update: {
        lastLogin: currentDate,
      },
      where: {
        email: userPayload.email,
      },
      include: {
        organization: true,
      },
    });

    const data = {
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        domain: user.organization.domain,
      },
      username: user.username,
      email: user.email,
      role: user.role,
      picture: user.picture,
      lastLogin: user.lastLogin,
    };

    const userToken = generateJWTToken(data);

    res.cookie("userToken", userToken, {
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
    });

    return res.status(200).json({
      success: true,
      message: "Login successfully!",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  googleAuth,
};
