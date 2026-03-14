import express from "express";
import cors from "cors";
import DbConnection from "./config/db.mjs";
import authRouter from "./routes/auth.route.js";
const app = express();

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

app.use("/api/auth", authRouter); // ← Moved up!
