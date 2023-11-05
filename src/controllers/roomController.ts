import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const getRooms = async (req: Request, res: Response) => {
  if (req.method !== "GET") {
    return res.status(400).json({
      success: false,
      message: "Request method is not allowed!",
    });
  }

  const { locationId } = req.params;

  if (!locationId) {
    return res.status(400).json({
      success: false,
      message: "Request params is missing!",
    });
  }

  const currentDate = new Date();

  currentDate.setUTCHours(0, 0, 0, 0);

  const currentTime = new Date();

  currentTime.setUTCSeconds(0, 0);

  try {
    let rooms = await prisma.room.findMany({
      where: {
        locationId: locationId,
        isActive: true,
      },
      include: {
        bookings: {
          where: {
            date: currentDate,
            fromTime: {
              lte: currentTime,
            },
            toTime: {
              gte: currentTime,
            },
            isActive: true,
          },
          orderBy: {
            fromTime: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    rooms = rooms.map((room) => {
      if (!room.bookings.length) {
        Object.assign(room, { isAvailable: true });
      } else {
        Object.assign(room, { isAvailable: false });
      }
      return room;
    });

    return res.status(200).json({
      success: true,
      message: "Rooms fetched successfully!",
      data: { rooms: rooms },
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getRoom = async (req: Request, res: Response) => {
  if (req.method !== "GET") {
    return res.status(400).json({
      success: false,
      message: "Request method is not allowed!",
    });
  }

  const { locationId, roomId } = req.params;

  if (!locationId || !roomId) {
    return res.status(400).json({
      success: false,
      message: "Request params is missing!",
    });
  }

  const currentDate = new Date();

  currentDate.setUTCHours(0, 0, 0, 0);

  const currentTime = new Date();

  currentTime.setUTCSeconds(0, 0);

  try {
    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        locationId: locationId,
        isActive: true,
      },
      include: {
        bookings: {
          where: {
            date: currentDate,
            OR: [
              {
                fromTime: {
                  gte: currentTime,
                },
              },
              {
                toTime: {
                  gte: currentTime,
                },
              },
            ],
            isActive: true,
          },
          include: {
            user: true,
          },
          orderBy: {
            fromTime: "asc",
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Room fetched successfully!",
      data: { room: room },
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const postRoom = async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    return res.status(400).json({
      success: false,
      message: "Request method is not allowed!",
    });
  }

  const { locationId } = req.params;

  const { title, capacity }: { title: string; capacity: number } = req.body;

  if (!locationId) {
    return res.status(400).json({
      success: false,
      message: "Request params is missing!",
    });
  }

  if (!title || !capacity) {
    return res.status(400).json({
      success: false,
      message: "Request body is missing!",
    });
  }

  try {
    const roomExist = await prisma.room.findFirst({
      where: {
        locationId: locationId,
        title: title.trim().toLowerCase(),
        isActive: true,
      },
    });

    if (!!roomExist) {
      return res.status(400).json({
        success: false,
        message: "Room already exist!",
      });
    }

    await prisma.room.create({
      data: {
        locationId: locationId,
        title: title.trim().toLowerCase(),
        capacity: capacity,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Room added successfully!",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const patchRoom = async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    return res.status(400).json({
      success: false,
      message: "Request method is not allowed!",
    });
  }

  const { locationId, roomId } = req.params;

  const { title, capacity }: { title: string; capacity: number } = req.body;

  if (!locationId || !roomId) {
    return res.status(400).json({
      success: false,
      message: "Request params is missing!",
    });
  }

  if (!title || !capacity) {
    return res.status(400).json({
      success: false,
      message: "Request body is missing!",
    });
  }

  try {
    await prisma.room.update({
      where: {
        id: roomId,
        locationId: locationId,
      },
      data: {
        title: title.trim().toLowerCase(),
        capacity: capacity,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Room updated successfully!",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteRoom = async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    return res.status(400).json({
      success: false,
      message: "Request method is not allowed!",
    });
  }

  const { locationId, roomId } = req.params;

  if (!locationId || !roomId) {
    return res.status(400).json({
      success: false,
      message: "Request params is missing!",
    });
  }

  try {
    await prisma.room.update({
      where: {
        id: roomId,
        locationId: locationId,
      },
      data: {
        isActive: false,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Room deleted successfully!",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getRooms,
  getRoom,
  postRoom,
  patchRoom,
  deleteRoom,
};
