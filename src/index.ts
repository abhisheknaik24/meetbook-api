import "./config";

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";
import { authenticateJWTToken } from "./middlewares/jwt";
import authRoutes from "./routes/authRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import locationRoutes from "./routes/locationRoutes";
import organizationRoutes from "./routes/organizationRoutes";
import roomRoutes from "./routes/roomRoutes";

const app: Express = express();

const port: number = Number(process.env.PORT) || 8000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: process.env.CLIENT_METHODS,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.use("/api/organizations", authenticateJWTToken, organizationRoutes);

app.use("/api/locations", authenticateJWTToken, locationRoutes);

app.use("/api/rooms", authenticateJWTToken, roomRoutes);

app.use("/api/bookings", authenticateJWTToken, bookingRoutes);

app.listen(port);
