"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const user_model_1 = __importDefault(require("../models/user.model"));
class AuthService {
    JWT_SECRET = process.env.JWT_SECRET || 'DAW-servidor-2025';
    GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
    googleClient;
    constructor() {
        this.googleClient = new google_auth_library_1.OAuth2Client(this.GOOGLE_CLIENT_ID);
    }
    async login(email, password) {
        try {
            // Buscar usuario por email o username
            const user = await user_model_1.default.findOne({
                $or: [{ email }, { username: email }]
            });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            const isValidPassword = await user.comparePassword(password);
            if (!isValidPassword) {
                throw new Error('Contraseña incorrecta');
            }
            const token = this.generateToken(user);
            return {
                success: true,
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar
                }
            };
        }
        catch (error) {
            throw error;
        }
    }
    async register(userData) {
        try {
            // Verificar si el usuario existe
            const existingUser = await user_model_1.default.findOne({
                $or: [
                    { email: userData.email },
                    { username: userData.username }
                ]
            });
            if (existingUser) {
                throw new Error('El usuario o email ya existe');
            }
            // Crear usuario
            const user = new user_model_1.default(userData);
            await user.save();
            const token = this.generateToken(user);
            return {
                success: true,
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            };
        }
        catch (error) {
            throw error;
        }
    }
    async getUserById(userId) {
        try {
            const user = await user_model_1.default.findById(userId).select('-password');
            return user;
        }
        catch (error) {
            throw error;
        }
    }
    async updateProfile(userId, profileData) {
        try {
            const user = await user_model_1.default.findByIdAndUpdate(userId, {
                username: profileData.username,
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                phone: profileData.phone,
                address: profileData.address,
                city: profileData.city,
                country: profileData.country,
                dateOfBirth: profileData.dateOfBirth
            }, { new: true }).select('-password');
            return {
                success: true,
                user
            };
        }
        catch (error) {
            throw error;
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await user_model_1.default.findById(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            const isValidPassword = await user.comparePassword(currentPassword);
            if (!isValidPassword) {
                throw new Error('Contraseña actual incorrecta');
            }
            user.password = newPassword;
            await user.save();
            return {
                success: true,
                message: 'Contraseña actualizada correctamente'
            };
        }
        catch (error) {
            throw error;
        }
    }
    async googleLogin(token) {
        try {
            if (!this.GOOGLE_CLIENT_ID) {
                throw new Error('Google Client ID no configurado');
            }
            // Verificar el token con Google
            const ticket = await this.googleClient.verifyIdToken({
                idToken: token,
                audience: this.GOOGLE_CLIENT_ID
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new Error('Token de Google inválido');
            }
            const { email, name, picture, sub: googleId } = payload;
            if (!email) {
                throw new Error('Email no disponible en la cuenta de Google');
            }
            // Buscar usuario existente
            let user = await user_model_1.default.findOne({ email });
            if (user) {
                // Usuario existe, actualizar información de Google si es necesario
                if (!user.googleId) {
                    user.googleId = googleId;
                    user.avatar = picture;
                    await user.save();
                }
            }
            else {
                // Crear nuevo usuario
                const username = email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 4);
                user = new user_model_1.default({
                    username,
                    email,
                    password: 'google_auth_' + Math.random().toString(36), // Password temporal
                    googleId,
                    avatar: picture,
                    firstName: name?.split(' ')[0] || '',
                    lastName: name?.split(' ').slice(1).join(' ') || '',
                    role: 'user'
                });
                await user.save();
            }
            const jwtToken = this.generateToken(user);
            return {
                success: true,
                token: jwtToken,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            };
        }
        catch (error) {
            throw error;
        }
    }
    generateToken(user) {
        return jsonwebtoken_1.default.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }, this.JWT_SECRET, { expiresIn: '30d' });
    }
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.JWT_SECRET);
        }
        catch (error) {
            throw new Error('Token inválido');
        }
    }
}
exports.default = AuthService;
//# sourceMappingURL=auth.service.js.map