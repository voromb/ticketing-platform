"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vipRoutes = vipRoutes;
const vip_controller_1 = require("../controllers/vip.controller");
async function vipRoutes(fastify) {
    // Rutas de configuración VIP (sin autenticación por ahora)
    fastify.get('/config', vip_controller_1.VipController.getVipConfig);
    fastify.put('/config', vip_controller_1.VipController.updateVipConfig);
    // Rutas de beneficios VIP
    fastify.post('/benefits', vip_controller_1.VipController.createBenefit);
    fastify.put('/benefits/:id', vip_controller_1.VipController.updateBenefit);
    fastify.delete('/benefits/:id', vip_controller_1.VipController.deleteBenefit);
    // Rutas de cálculo y estadísticas
    fastify.post('/calculate-discount', vip_controller_1.VipController.calculateVipDiscount);
    fastify.get('/stats', vip_controller_1.VipController.getVipStats);
}
