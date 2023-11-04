import { Router } from "express";
import roomController from "../controllers/roomController";

const router: Router = Router();

router.get("/:locationId", roomController.getRooms);

router.get("/:locationId/:roomId", roomController.getRoom);

router.post("/:locationId", roomController.postRoom);

router.patch("/:locationId/:roomId", roomController.patchRoom);

router.delete("/:locationId/:roomId", roomController.deleteRoom);

export default router;
