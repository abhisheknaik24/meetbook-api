import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const getLocations = async (req: Request, res: Response) => {
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
    const locations = await prisma.location.findMany({
      where: {
        organizationId: organizationId,
        isActive: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Locations fetched successfully!",
      data: { locations: locations },
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getLocation = async (req: Request, res: Response) => {
  if (req.method !== "GET") {
    return res.status(400).json({
      success: false,
      message: "Request method is not allowed!",
    });
  }

  const { organizationId, locationId } = req.params;

  if (!organizationId || !locationId) {
    return res.status(400).json({
      success: false,
      message: "Request params is missing!",
    });
  }

  try {
    const location = await prisma.location.findFirst({
      where: {
        id: locationId,
        organizationId: organizationId,
        isActive: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Location fetched successfully!",
      data: { location: location },
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const postLocation = async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    return res.status(400).json({
      success: false,
      message: "Request method is not allowed!",
    });
  }

  const { organizationId } = req.params;

  const { name }: { name: string } = req.body;

  if (!organizationId) {
    return res.status(400).json({
      success: false,
      message: "Request params is missing!",
    });
  }

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Request body is missing!",
    });
  }

  try {
    const locationExist = await prisma.location.findFirst({
      where: {
        organizationId: organizationId,
        name: name.trim().toLowerCase(),
        isActive: true,
      },
    });

    if (!!locationExist) {
      return res.status(400).json({
        success: false,
        message: "Location already exist!",
      });
    }

    await prisma.location.create({
      data: {
        organizationId: organizationId,
        name: name.trim().toLowerCase(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Location added successfully!",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const patchLocation = async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    return res.status(400).json({
      success: false,
      message: "Request method is not allowed!",
    });
  }

  const { organizationId, locationId } = req.params;

  const { name }: { name: string } = req.body;

  if (!organizationId || !locationId) {
    return res.status(400).json({
      success: false,
      message: "Request params is missing!",
    });
  }

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Request body is missing!",
    });
  }

  try {
    await prisma.location.update({
      where: {
        id: locationId,
        organizationId: organizationId,
      },
      data: {
        name: name.trim().toLowerCase(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Location updated successfully!",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteLocation = async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    return res.status(400).json({
      success: false,
      message: "Request method is not allowed!",
    });
  }

  const { organizationId, locationId } = req.params;

  if (!organizationId || !locationId) {
    return res.status(400).json({
      success: false,
      message: "Request params is missing!",
    });
  }

  try {
    await prisma.location.update({
      where: {
        id: locationId,
        organizationId: organizationId,
      },
      data: {
        isActive: false,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Location deleted successfully!",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getLocations,
  getLocation,
  postLocation,
  patchLocation,
  deleteLocation,
};
