import { Router } from "express";
import {
  createWorkshop,
  getAllWorkshops,
  deleteWorkshop,
  getWorkshopByItsId,
} from "../controllers/workshop.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router
  .route("/create-workshop")
  .post(upload.single("imageUrl"), createWorkshop);
router.route("/get-all-workshops").get(getAllWorkshops);
router.route("/get-workshop/:id").get(getWorkshopByItsId);
router.route("/delete-workshop/:id").delete(deleteWorkshop);

export default router;
