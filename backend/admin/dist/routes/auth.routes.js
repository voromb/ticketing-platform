"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const auth_controller_1 = require("../controllers/auth.controller");
async function authRoutes(server) {
    const authController = new auth_controller_1.AuthController(server);
    server.post('/login', authController.login.bind(authController));
}
