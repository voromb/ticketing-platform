import { FastifyInstance } from 'fastify';
import { VipController } from '../controllers/vip.controller';

export async function vipRoutes(fastify: FastifyInstance) {
  // Rutas de configuración VIP
  fastify.get('/config', {
    preHandler: [fastify.authenticate, fastify.requireAdmin]
  }, VipController.getVipConfig);
  
  fastify.put('/config', {
    preHandler: [fastify.authenticate, fastify.requireAdmin]
  }, VipController.updateVipConfig);

  // Rutas de beneficios VIP
  fastify.post('/benefits', {
    preHandler: [fastify.authenticate, fastify.requireAdmin]
  }, VipController.createBenefit);
  
  fastify.put('/benefits/:id', {
    preHandler: [fastify.authenticate, fastify.requireAdmin]
  }, VipController.updateBenefit);
  
  fastify.delete('/benefits/:id', {
    preHandler: [fastify.authenticate, fastify.requireAdmin]
  }, VipController.deleteBenefit);

  // Rutas de cálculo y estadísticas
  fastify.post('/calculate-discount', {
    preHandler: [fastify.authenticate, fastify.requireAdmin]
  }, VipController.calculateVipDiscount);
  
  fastify.get('/stats', {
    preHandler: [fastify.authenticate, fastify.requireAdmin]
  }, VipController.getVipStats);
}
