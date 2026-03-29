import cors from "cors";
import express from "express";
import "./cron/monthlyReport.mjs";
import DbConnection from "./config/db.mjs";
import authRouter from "./routes/auth.route.js";
import leaveRouter from "./routes/leave.route.js";

const app = express();

const PORT = process.env.PORT || 5000;

// CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB Connection
DbConnection();

app.get("/", (req, res) => {
  res.send("Hello World - Backend is running!");
});

app.use("/api/auth", authRouter); 
app.use("/api/leave", leaveRouter); 


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
