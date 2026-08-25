import express from "express";
import { fileURLToPath } from "url";
import catchError from "./Utils/catchError.js";
import HandleERROR from "./Utils/handleError.js";
import path from "path";
import cors from "cors"; // این ایمپورت درسته

// ... بقیه ایمپورت‌های روت‌ها
import authRouter from "./Routes/Auth.js";
import activityRouter from "./Routes/Activity.js";
import rewardRouter from "./Routes/Reward.js";
import studentActivityRouter from "./Routes/StudentActivity.js";
import studentRewardRouter from "./Routes/StudentReward.js";
import updateStatusRouter from "./Routes/UpdateStatus.js";
import adminActivityRouter from "./Routes/AdminActivity.js";
import userRouter from "./Routes/User.js";
import exelRouter from "./Routes/Exel.js";
import dashboardRouter from "./Routes/dashboard.js";
import studentDashboardRouter from "./Routes/studentDashboard.js";
import myActivitiesRouter from "./Routes/myActivities.js";
import adminReviewRouter from "./Routes/adminReview.js";
import reportRouter from "./Routes/Report.js";
import notifRouter from "./Routes/Notification.js";


const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const app = express();


const corsOptions = {
  origin: true, // بازتاب داینامیک دامنه‌های ورسل و لوکال برای پشتیبانی از credentials
  methods: "GET,POST,PUT,DELETE,PATCH,HEAD,OPTIONS",
  allowedHeaders: "Content-Type,Authorization,X-Requested-With,Accept",
  credentials: true,
};

// میدل‌ور cors برای تمامی مسیرها
app.use(cors(corsOptions));

// پاسخ به درخواست‌های preflight (OPTIONS)
app.options('*', cors(corsOptions));


app.use(express.json());
app.use(express.static("Public")); 

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "KA-Platform Backend API is running successfully!",
    frontends: {
      student: "http://localhost:5173",
      admin: "http://localhost:5174",
      superAdmin: "http://localhost:5175"
    }
  });
});



// حالا روت‌ها رو مثل قبل تعریف می‌کنیم
app.use("/api/auth",authRouter)
app.use("/api/update-status",updateStatusRouter)
app.use("/api/activity",activityRouter)
app.use("/api/activities",activityRouter)
app.use("/api/reward",rewardRouter)
app.use("/api/rewards",rewardRouter)
app.use("/api/student-activity",studentActivityRouter)
app.use("/api/student-activities",studentActivityRouter)
app.use("/api/admin-activity",adminActivityRouter)
app.use("/api/admin-activities",adminActivityRouter)
app.use("/api/student-reward",studentRewardRouter)
app.use("/api/student-rewards",studentRewardRouter)
app.use("/api/users",userRouter)
app.use("/api/exel",exelRouter)
app.use('/api/dashboard', dashboardRouter);
app.use('/api/student-dashboard', studentDashboardRouter);
app.use('/api/my-activities', myActivitiesRouter);
app.use('/api/admin-review', adminReviewRouter);
app.use('/api/reports', reportRouter);
app.use('/api/notifications', notifRouter);


app.use("*", (req, res, next) => { 
  next(new HandleERROR("Route not Found", 404));
});
app.use(catchError); 

export default app;