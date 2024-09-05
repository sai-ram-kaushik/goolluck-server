import { Router } from "express";
import { createUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/create-user").post(createUser)

export default router;