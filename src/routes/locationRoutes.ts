import { Router } from "express";
import locationController from "../controllers/locationController";

const router: Router = Router();

router.get("/:organizationId", locationController.getLocations);

router.get("/:organizationId/:locationId", locationController.getLocation);

router.post("/:organizationId", locationController.postLocation);

router.patch("/:organizationId/:locationId", locationController.patchLocation);

router.delete(
  "/:organizationId/:locationId",
  locationController.deleteLocation
);

export default router;
