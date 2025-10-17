import { Request, Response } from "express";
import axios from "axios";
import Like from "../models/likes.model";
import { AuthRequest } from "../middlewares/auth.middleware";

// URL del microservicio de eventos
const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL || "http://localhost:3003/api/events";

/**
 * @desc Dar like a un evento (valida con servicio de eventos)
 * @route POST /api/events/:eventId/like
 * @access Usuario autenticado
 */
export const addLike = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    
    const eventRes = await axios.get(`${EVENT_SERVICE_URL}/${eventId}`).catch(() => null);
    if (!eventRes || eventRes.status !== 200) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

 
    const existing = await Like.findOne({ userId, eventId });
    if (existing) {
      return res.status(400).json({ message: "Ya diste like a este evento" });
    }

  
    const like = await Like.create({ userId, eventId });
    res.status(201).json({ message: "Like agregado", like });
  } catch (error) {
    console.error("[LIKE] Error al agregar like:", error);
    res.status(500).json({ message: "Error interno al agregar like" });
  }
};

/**
 * @desc Quitar like de un evento
 * @route DELETE /api/events/:eventId/like
 * @access Usuario autenticado
 */
export const removeLike = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const like = await Like.findOneAndDelete({ userId, eventId });
    if (!like) {
      return res.status(404).json({ message: "Like no encontrado" });
    }

    res.status(200).json({ message: "Like eliminado" });
  } catch (error) {
    console.error("[LIKE] Error al eliminar like:", error);
    res.status(500).json({ message: "Error interno al eliminar like" });
  }
};

/**
 * @desc Obtener todos los likes de un evento
 * @route GET /api/events/:eventId/likes
 * @access Público
 */
export const getLikesByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    const likes = await Like.find({ eventId }).populate("userId", "username avatar");

    res.status(200).json({
      totalLikes: likes.length,
      users: likes.map((like) => like.userId),
    });
  } catch (error) {
    console.error("[LIKE] Error al obtener likes:", error);
    res.status(500).json({ message: "Error interno al obtener likes" });
  }
};
