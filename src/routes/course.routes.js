import { Router } from "express";
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
} from "../controllers/course.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.route("/create-course").post(upload.single("imageUrl"), createCourse);
router.route("/get-all-courses").get(getAllCourses);
router.route("/get-course/:id").get(getCourseById);
router.route("/delete-course/:id").delete(deleteCourse);

export default router;
