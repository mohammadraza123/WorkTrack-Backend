import express from "express";
import { handleAddLeave, handleGetAll, handleGetById, handleUpdateLeaveStatus } from "../controllers/leave.controller.mjs";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();



router.post("/add",authMiddleware, handleAddLeave);
router.get("/", handleGetAll);

// get by id 
router.get("/:id", handleGetById);


router.patch("/:id/status", authMiddleware, handleUpdateLeaveStatus);
export default router;
