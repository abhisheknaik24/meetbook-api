import { Router } from "express";
import bookingController from "../controllers/bookingController";

const router: Router = Router();

router.get("/:roomId", bookingController.getBookings);

router.get("/:roomId/:bookingId", bookingController.getBooking);

router.post("/:roomId", bookingController.postBooking);

router.delete("/:roomId/:bookingId", bookingController.deleteBooking);

export default router;
