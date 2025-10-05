import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

export function setAuditContext(request: FastifyRequest) {
  console.log('Setting audit context for:', request.url);
}

export function clearAuditContext() {
  console.log('Clearing audit context');
}

export function registerAuditMiddleware(prisma: PrismaClient) {
  console.log('Audit middleware registered');
}

export async function auditContextMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  setAuditContext(request);
  
  reply.addHook('onSend', async () => {
    clearAuditContext();
  });
}
