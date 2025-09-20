"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.default();
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/google-login', authController.googleLogin);
router.get('/profile', auth_middleware_1.authMiddleware, authController.getProfile);
router.put('/profile', auth_middleware_1.authMiddleware, authController.updateProfile);
router.put('/change-password', auth_middleware_1.authMiddleware, authController.changePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map