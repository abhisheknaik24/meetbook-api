import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const getBookings = async (req: Request, res: Response) => {
  if (req.method !== "GET") {
    return res.status(400).json({
      success: false,
      message: "Request method is not allowed!",
    });
  }

  const { roomId } = req.params;

  if (!roomId) {
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
    const bookings = await prisma.booking.findMany({
      where: {
        roomId: roomId,
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
    });

    return res.status(200).json({
      success: true,
      message: "Bookings fetched successfully!",
      data: { bookings: bookings },
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getBooking = async (req: Request, res: Response) => {
  if (req.method !== "GET") {
    return res.status(400).json({
      success: false,
      message: "Request method is not allowed!",
    });
  }

  const { roomId, bookingId } = req.params;

  if (!roomId || !bookingId) {
    return res.status(400).json({
      success: false,
      message: "Request params is missing!",
    });
  }

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        roomId: roomId,
        isActive: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Booking fetched successfully!",
      data: { booking: booking },
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const postBooking = async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    return res.status(400).json({
      success: false,
      message: "Request method is not allowed!",
    });
  }

  const { roomId } = req.params;

  const {
    summary,
    description,
    date,
    fromTime,
    toTime,
    guests,
    isCalendarEvent,
  }: {
    summary: string;
    description: string | undefined;
    date: Date;
    fromTime: Date;
    toTime: Date;
    guests: string | undefined;
    isCalendarEvent: boolean;
  } = req.body;

  if (!roomId) {
    return res.status(400).json({
      success: false,
      message: "Request params is missing!",
    });
  }

  if (!summary || !date || !fromTime || !toTime) {
    return res.status(400).json({
      success: false,
      message: "Request body is missing!",
    });
  }

  const timeZone = "Asia/Kolkata";

  const parsedDate = new Date(date);

  parsedDate.setUTCHours(0, 0, 0, 0);

  const currentTime = new Date();

  currentTime.setUTCSeconds(0, 0);

  const parsedFromTime = new Date(fromTime);

  parsedFromTime.setUTCSeconds(0, 0);

  const parsedToTime = new Date(toTime);

  parsedToTime.setUTCSeconds(0, 0);

  if (parsedFromTime < currentTime || parsedToTime < currentTime) {
    return res.status(400).json({
      status: false,
      message: "From and To time is less than current time!",
    });
  }

  const differenceTime = parsedToTime.getTime() - parsedFromTime.getTime();

  if (differenceTime < 60000) {
    return res.status(400).json({
      status: false,
      message: "Atleast book room for more than one minute!",
    });
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        roomId: roomId,
        AND: [
          {
            fromTime: {
              lt: parsedToTime,
            },
          },
          {
            toTime: {
              gt: parsedFromTime,
            },
          },
        ],
        isActive: true,
      },
    });

    if (!!bookings.length) {
      return res.status(400).json({
        status: false,
        message: "The room has already book for this time!",
      });
    }

    let eventId: string | null = null;

    const body = {
      summary: summary,
      description: description || "",
      start: {
        dateTime: parsedFromTime.toISOString(),
        timeZone: timeZone,
      },
      end: {
        dateTime: parsedToTime.toISOString(),
        timeZone: timeZone,
      },
      attendees: guests
        ? guests.split(",").map((guest) => {
            return { email: guest };
          })
        : [],
    };

    if (isCalendarEvent) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_GOOGLE_API}/calendar/v3/calendars/primary/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${""}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data: any = await response.json();

      if (!response.ok) {
        return res.status(400).json({
          status: false,
          message: "Something went wrong!",
        });
      }

      eventId = data.id;
    }

    await prisma.booking.create({
      data: {
        userId: "",
        roomId: roomId,
        eventId: eventId,
        summary: summary.trim().toLowerCase(),
        description: description?.trim(),
        date: parsedDate,
        fromTime: parsedFromTime,
        toTime: parsedToTime,
        guests: guests,
        isCalendarEvent: isCalendarEvent,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Booking added successfully!",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteBooking = async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    return res.status(400).json({
      success: false,
      message: "Request method is not allowed!",
    });
  }

  const { roomId, bookingId } = req.params;

  if (!roomId || !bookingId) {
    return res.status(400).json({
      success: false,
      message: "Request params is missing!",
    });
  }

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        roomId: roomId,
      },
    });

    if (!booking) {
      return res.status(400).json({
        status: false,
        message: "Booking not found!",
      });
    }

    if (booking.isCalendarEvent) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_GOOGLE_API}/calendar/v3/calendars/primary/events/${booking.eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${""}`,
          },
        }
      );

      if (!response.ok) {
        return res.status(400).json({
          status: false,
          message: "Something went wrong!",
        });
      }
    }

    await prisma.booking.update({
      where: {
        id: bookingId,
        roomId: roomId,
      },
      data: {
        isActive: false,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully!",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getBookings,
  getBooking,
  postBooking,
  deleteBooking,
};
