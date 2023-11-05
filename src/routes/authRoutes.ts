import { Router } from "express";
import authController from "../controllers/authController";

const router: Router = Router();

router.post("/google", authController.googleAuth);

export default router;
