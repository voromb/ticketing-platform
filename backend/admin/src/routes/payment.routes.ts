import { FastifyInstance } from 'fastify';
import PaymentController from '../controllers/payment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export async function paymentRoutes(fastify: FastifyInstance) {
  
  // ==================== RUTAS PRIVADAS (Requieren autenticación) ====================
  fastify.register(async (fastify) => {
    fastify.addHook('preHandler', authMiddleware);

    // Crear sesión de checkout
    fastify.post('/create-checkout', PaymentController.createCheckoutSession.bind(PaymentController));

    // Completar pago interno (cuando no hay Stripe configurado)
    fastify.post('/complete-payment', PaymentController.completeDemoPayment.bind(PaymentController));

    // Verificar estado de pago
    fastify.get('/status/:sessionId', PaymentController.checkPaymentStatus.bind(PaymentController));
  });

  // ==================== WEBHOOK (Sin autenticación) ====================
  // El webhook de Stripe viene desde sus servidores, no requiere JWT
  fastify.post('/webhook', {
    config: {
      rawBody: true // Necesario para verificar firma de Stripe
    }
  }, PaymentController.handleWebhook.bind(PaymentController));
}
