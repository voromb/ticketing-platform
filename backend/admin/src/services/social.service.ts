import axios from 'axios';
import { logger } from '../utils/logger';

class SocialService {
    private userServiceUrl: string;

    constructor() {
        this.userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
    }

    // ==================== LIKE METHODS ====================
    
    /**
     * Obtener estadísticas de likes de un evento
     */
    async getEventLikes(eventId: string, userId?: string) {
        try {
            const url = `${this.userServiceUrl}/api/social/events/${eventId}/likes`;
            const response = await axios.get(url, {
                headers: userId ? { 'Authorization': `Bearer ${userId}` } : {}
            });
            return response.data;
        } catch (error: any) {
            logger.error('Error getting event likes:', error.message);
            return { success: false, totalLikes: 0, isLikedByUser: false };
        }
    }

    // ==================== COMMENT METHODS ====================
    
    /**
     * Obtener comentarios de un evento
     */
    async getEventComments(eventId: string, page: number = 1, limit: number = 20) {
        try {
            const url = `${this.userServiceUrl}/api/social/events/${eventId}/comments`;
            const response = await axios.get(url, {
                params: { page, limit }
            });
            return response.data;
        } catch (error: any) {
            logger.error('Error getting event comments:', error.message);
            return { success: false, comments: [], total: 0 };
        }
    }

    // ==================== USER FOLLOW METHODS ====================
    
    /**
     * Obtener estadísticas de follows de un usuario
     */
    async getUserFollowStats(userId: string, currentUserId?: string) {
        try {
            const url = `${this.userServiceUrl}/api/social/users/${userId}/follow-stats`;
            const response = await axios.get(url, {
                headers: currentUserId ? { 'Authorization': `Bearer ${currentUserId}` } : {}
            });
            return response.data;
        } catch (error: any) {
            logger.error('Error getting user follow stats:', error.message);
            return { success: false, followersCount: 0, followingCount: 0, isFollowing: false };
        }
    }

    /**
     * Obtener lista de seguidores
     */
    async getUserFollowers(userId: string, page: number = 1, limit: number = 20) {
        try {
            const url = `${this.userServiceUrl}/api/social/users/${userId}/followers`;
            const response = await axios.get(url, {
                params: { page, limit }
            });
            return response.data;
        } catch (error: any) {
            logger.error('Error getting user followers:', error.message);
            return { success: false, followers: [], total: 0 };
        }
    }

    /**
     * Obtener lista de usuarios seguidos
     */
    async getUserFollowing(userId: string, page: number = 1, limit: number = 20) {
        try {
            const url = `${this.userServiceUrl}/api/social/users/${userId}/following`;
            const response = await axios.get(url, {
                params: { page, limit }
            });
            return response.data;
        } catch (error: any) {
            logger.error('Error getting user following:', error.message);
            return { success: false, following: [], total: 0 };
        }
    }

    // ==================== COMBINED STATS ====================
    
    /**
     * Obtener todas las estadísticas sociales de un evento
     */
    async getEventSocialStats(eventId: string, userId?: string) {
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
        } catch (error: any) {
            logger.error('Error getting event social stats:', error.message);
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

export default new SocialService();
