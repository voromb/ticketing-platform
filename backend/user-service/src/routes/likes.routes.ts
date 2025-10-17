import express from "express";
import { addLike, removeLike, getLikesByEvent } from "../controllers/likes.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/events/:eventId/like", authMiddleware, addLike);
router.delete("/events/:eventId/like", authMiddleware, removeLike);
router.get("/events/:eventId/likes", getLikesByEvent);

export default router;
