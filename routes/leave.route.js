import express from "express";
import { handleAddLeave } from "../controllers/leave.controller.mjs";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();



//signup
router.post("/add",authMiddleware, handleAddLeave);


export default router;
