import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const getOrganizations = async (req: Request, res: Response) => {
  if (req.method !== "GET") {
    return res.status(400).json({
      success: false,
      message: "Request method is not allowed!",
    });
  }

  try {
    const organizations = await prisma.organization.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Organizations fetched successfully!",
      data: { organizations: organizations },
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getOrganization = async (req: Request, res: Response) => {
  if (req.method !== "GET") {
    return res.status(400).json({
      success: false,
      message: "Request method is not allowed!",
    });
  }

  const { organizationId } = req.params;

  if (!organizationId) {
    return res.status(400).json({
      success: false,
      message: "Request params is missing!",
    });
  }

  try {
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        isActive: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Organization fetched successfully!",
      data: { organization: organization },
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const postOrganization = async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    return res.status(400).json({
      success: false,
      message: "Request method is not allowed!",
    });
  }

  const { name, domain }: { name: string; domain: string } = req.body;

  if (!name || !domain) {
    return res.status(400).json({
      success: false,
      message: "Request body is missing!",
    });
  }

  try {
    const organizationExist = await prisma.organization.findFirst({
      where: {
        name: name.trim().toLowerCase(),
        domain: domain.trim(),
        isActive: true,
      },
    });

    if (!!organizationExist) {
      return res.status(400).json({
        success: false,
        message: "Organization already exist!",
      });
    }

    await prisma.organization.create({
      data: {
        name: name.trim().toLowerCase(),
        domain: domain.trim(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Organization added successfully!",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const patchOrganization = async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    return res.status(400).json({
      success: false,
      message: "Request method is not allowed!",
    });
  }

  const { organizationId } = req.params;

  const { name, domain }: { name: string; domain: string } = req.body;

  if (!organizationId) {
    return res.status(400).json({
      success: false,
      message: "Request params is missing!",
    });
  }

  if (!name || !domain) {
    return res.status(400).json({
      success: false,
      message: "Request body is missing!",
    });
  }

  try {
    await prisma.organization.update({
      where: {
        id: organizationId,
      },
      data: {
        name: name.trim().toLowerCase(),
        domain: domain.trim(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Organization updated successfully!",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteOrganization = async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    return res.status(400).json({
      success: false,
      message: "Request method is not allowed!",
    });
  }

  const { organizationId } = req.params;

  if (!organizationId) {
    return res.status(400).json({
      success: false,
      message: "Request params is missing!",
    });
  }

  try {
    await prisma.organization.update({
      where: {
        id: organizationId,
      },
      data: {
        isActive: false,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Organization deleted successfully!",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getOrganizations,
  getOrganization,
  postOrganization,
  patchOrganization,
  deleteOrganization,
};
