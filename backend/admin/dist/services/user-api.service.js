"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userApiService = exports.UserApiService = void 0;
const axios_1 = __importDefault(require("axios"));
class UserApiService {
    client;
    baseUrl;
    constructor() {
        this.baseUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
        this.client = axios_1.default.create({
            baseURL: this.baseUrl,
            timeout: 5000, // 5 segundos timeout
            headers: {
                'Content-Type': 'application/json',
            },
        });
        // Interceptor para logging
        this.client.interceptors.request.use((config) => {
            console.log(`[Admin->User API Call] ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        }, (error) => {
            console.error('[Admin->User API Call Error]', error);
            return Promise.reject(error);
        });
        // Interceptor para manejo de respuestas
        this.client.interceptors.response.use((response) => {
            console.log(`[Admin->User API Response] ${response.status} - ${response.config.url}`);
            return response;
        }, (error) => {
            console.error(`[Admin->User API Error] ${error.response?.status} - ${error.config?.url}`, error.message);
            return Promise.reject(error);
        });
    }
    /**
     * Obtener todos los usuarios del user-service
     */
    async getUsers() {
        try {
            const response = await this.client.get('/api/users');
            return response.data.users || [];
        }
        catch (error) {
            console.error('Error fetching users from user service:', error.message);
            throw new Error(`Failed to fetch users: ${error.message}`);
        }
    }
    /**
     * Obtener un usuario específico por ID
     */
    async getUserById(userId) {
        try {
            const response = await this.client.get(`/api/users/${userId}`);
            return response.data.user || null;
        }
        catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error(`Error fetching user ${userId} from user service:`, error.message);
            throw new Error(`Failed to fetch user: ${error.message}`);
        }
    }
    /**
     * Promocionar un usuario a VIP
     */
    async promoteUserToVip(userId, adminId) {
        try {
            const response = await this.client.patch(`/api/users/${userId}/promote`, {
                promotedBy: adminId,
                newRole: 'vip'
            });
            return response.data.user;
        }
        catch (error) {
            if (error.response?.status === 404) {
                throw new Error('Usuario no encontrado');
            }
            if (error.response?.status === 400) {
                throw new Error(error.response.data.error || 'El usuario ya es VIP o no se puede promocionar');
            }
            console.error(`Error promoting user ${userId} to VIP:`, error.message);
            throw new Error(`Failed to promote user: ${error.message}`);
        }
    }
    /**
     * Degradar un usuario VIP a usuario normal
     */
    async demoteVipToUser(userId, adminId) {
        try {
            const response = await this.client.patch(`/api/users/${userId}/demote`, {
                demotedBy: adminId,
                newRole: 'user'
            });
            return response.data.user;
        }
        catch (error) {
            if (error.response?.status === 404) {
                throw new Error('Usuario no encontrado');
            }
            if (error.response?.status === 400) {
                throw new Error(error.response.data.error || 'El usuario ya es normal o no se puede degradar');
            }
            console.error(`Error demoting user ${userId} from VIP:`, error.message);
            throw new Error(`Failed to demote user: ${error.message}`);
        }
    }
    /**
     * Verificar salud del user service
     */
    async healthCheck() {
        try {
            const response = await this.client.get('/health');
            return response.status === 200;
        }
        catch (error) {
            console.error('User service health check failed:', error);
            return false;
        }
    }
}
exports.UserApiService = UserApiService;
// Singleton instance
exports.userApiService = new UserApiService();
