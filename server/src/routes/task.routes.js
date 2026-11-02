import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTask,
  getWeeklySummary,
  listTasks,
  updateTask,
} from "../controllers/task.controller.js";

const router = Router();

router.get("/", listTasks);
router.post("/", createTask);
router.get("/weeks", getWeeklySummary);
router.get("/:id", getTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
