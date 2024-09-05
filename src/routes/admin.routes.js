import { Router } from "express";
import { loginAdmin, registeredAdmin } from "../controllers/admin.controller.js";

const router = Router();

router.route("/create-admin").post(registeredAdmin);
router.route("/login-admin").post(loginAdmin)

export default router;
