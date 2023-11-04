import "./config";

import cors from "cors";
import express, { Express } from "express";
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

app.use("/api/organizations", organizationRoutes);

app.use("/api/locations", locationRoutes);

app.use("/api/rooms", roomRoutes);

app.use("/api/bookings", bookingRoutes);

app.listen(port);
