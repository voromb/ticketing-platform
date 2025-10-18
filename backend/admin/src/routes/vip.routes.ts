import { FastifyInstance } from 'fastify';
import { VipController } from '../controllers/vip.controller';

export async function vipRoutes(fastify: FastifyInstance) {
  // Rutas de configuración VIP (sin autenticación por ahora)
  fastify.get('/config', VipController.getVipConfig);
  fastify.put('/config', VipController.updateVipConfig);

  // Rutas de beneficios VIP
  fastify.post('/benefits', VipController.createBenefit);
  fastify.put('/benefits/:id', VipController.updateBenefit);
  fastify.delete('/benefits/:id', VipController.deleteBenefit);

  // Rutas de cálculo y estadísticas
  fastify.post('/calculate-discount', VipController.calculateVipDiscount);
  fastify.get('/stats', VipController.getVipStats);
}
