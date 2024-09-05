import cookieParser from "cookie-parser";
import express, { urlencoded } from "express";
import cors from "cors";

const app = express();

app.use(cookieParser());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json({ limit: "16kb" }));
app.use(urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// admin routes imports
import adminRouter from "./routes/admin.routes.js";
import courseRouter from "./routes/course.routes.js";
import workshopRouter from "./routes/workshop.routes.js";

app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/admin", courseRouter);
app.use("/api/v1/admin", workshopRouter);

// user routes imports
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/users", userRouter);

export { app };
