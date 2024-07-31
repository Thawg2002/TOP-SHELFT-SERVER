import { Router } from "express";
import { logingoogle } from "../controllers/logingoogle";

const router = Router();

router.post("/google/verify", logingoogle);
export default router;
