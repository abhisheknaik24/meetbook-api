import { Router } from "express";
import organizationController from "../controllers/organizationController";

const router: Router = Router();

router.get("/", organizationController.getOrganizations);

router.get("/:organizationId", organizationController.getOrganization);

router.post("/", organizationController.postOrganization);

router.patch("/:organizationId", organizationController.patchOrganization);

router.delete("/:organizationId", organizationController.deleteOrganization);

export default router;
