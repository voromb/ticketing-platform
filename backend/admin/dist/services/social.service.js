"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
class SocialService {
    userServiceUrl;
    constructor() {
        this.userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
    }
    // ==================== LIKE METHODS ====================
    /**
     * Obtener estadísticas de likes de un evento
     */
    async getEventLikes(eventId, userId) {
        try {
            const url = `${this.userServiceUrl}/api/social/events/${eventId}/likes`;
            const response = await axios_1.default.get(url, {
                headers: userId ? { 'Authorization': `Bearer ${userId}` } : {}
            });
            return response.data;
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Error getting event likes');
            return { success: false, totalLikes: 0, isLikedByUser: false };
        }
    }
    // ==================== COMMENT METHODS ====================
    /**
     * Obtener comentarios de un evento
     */
    async getEventComments(eventId, page = 1, limit = 20) {
        try {
            const url = `${this.userServiceUrl}/api/social/events/${eventId}/comments`;
            const response = await axios_1.default.get(url, {
                params: { page, limit }
            });
            return response.data;
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Error getting event comments');
            return { success: false, comments: [], total: 0 };
        }
    }
    // ==================== USER FOLLOW METHODS ====================
    /**
     * Obtener estadísticas de follows de un usuario
     */
    async getUserFollowStats(userId, currentUserId) {
        try {
            const url = `${this.userServiceUrl}/api/social/users/${userId}/follow-stats`;
            const response = await axios_1.default.get(url, {
                headers: currentUserId ? { 'Authorization': `Bearer ${currentUserId}` } : {}
            });
            return response.data;
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Error getting user follow stats');
            return { success: false, followersCount: 0, followingCount: 0, isFollowing: false };
        }
    }
    /**
     * Obtener lista de seguidores
     */
    async getUserFollowers(userId, page = 1, limit = 20) {
        try {
            const url = `${this.userServiceUrl}/api/social/users/${userId}/followers`;
            const response = await axios_1.default.get(url, {
                params: { page, limit }
            });
            return response.data;
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Error getting user followers');
            return { success: false, followers: [], total: 0 };
        }
    }
    /**
     * Obtener lista de usuarios seguidos
     */
    async getUserFollowing(userId, page = 1, limit = 20) {
        try {
            const url = `${this.userServiceUrl}/api/social/users/${userId}/following`;
            const response = await axios_1.default.get(url, {
                params: { page, limit }
            });
            return response.data;
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Error getting user following');
            return { success: false, following: [], total: 0 };
        }
    }
    // ==================== COMBINED STATS ====================
    /**
     * Obtener todas las estadísticas sociales de un evento
     */
    async getEventSocialStats(eventId, userId) {
        try {
            const [likesData, commentsData] = await Promise.all([
                this.getEventLikes(eventId, userId),
                this.getEventComments(eventId, 1, 1) // Solo necesitamos el total
            ]);
            return {
                success: true,
                eventId,
                likesCount: likesData.totalLikes || 0,
                commentsCount: commentsData.total || 0,
                isLikedByUser: likesData.isLikedByUser || false
            };
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Error getting event social stats');
            return {
                success: false,
                eventId,
                likesCount: 0,
                commentsCount: 0,
                isLikedByUser: false
            };
        }
    }
}
exports.default = new SocialService();
