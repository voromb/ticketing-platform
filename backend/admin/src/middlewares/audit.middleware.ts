import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

export function setAuditContext(request: FastifyRequest) {
  // Implementación temporal
  console.log('Setting audit context for:', request.url);
}

export function clearAuditContext() {
  // Implementación temporal
  console.log('Clearing audit context');
}

export function registerAuditMiddleware(prisma: PrismaClient) {
  // Implementación temporal
  console.log('Audit middleware registered');
}

export async function auditContextMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Implementación temporal
  setAuditContext(request);
  
  reply.addHook('onSend', async () => {
    clearAuditContext();
  });
}
