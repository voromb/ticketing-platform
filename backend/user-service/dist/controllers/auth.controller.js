"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("../services/auth.service"));
class AuthController {
    authService;
    constructor() {
        this.authService = new auth_service_1.default();
    }
    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y contraseña son requeridos'
                });
            }
            const result = await this.authService.login(email, password);
            res.json(result);
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    };
    register = async (req, res) => {
        try {
            const result = await this.authService.register(req.body);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };
    getProfile = async (req, res) => {
        try {
            const user = await this.authService.getUserById(req.user.id);
            res.json({
                success: true,
                user
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };
    updateProfile = async (req, res) => {
        try {
            const result = await this.authService.updateProfile(req.user.id, req.body);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };
    changePassword = async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Contraseña actual y nueva contraseña son requeridas'
                });
            }
            const result = await this.authService.changePassword(req.user.id, currentPassword, newPassword);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };
    googleLogin = async (req, res) => {
        try {
            const { token } = req.body;
            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Token de Google es requerido'
                });
            }
            const result = await this.authService.googleLogin(token);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };
}
exports.default = AuthController;
//# sourceMappingURL=auth.controller.js.map