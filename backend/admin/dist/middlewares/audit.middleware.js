"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuditContext = setAuditContext;
exports.clearAuditContext = clearAuditContext;
exports.registerAuditMiddleware = registerAuditMiddleware;
exports.auditContextMiddleware = auditContextMiddleware;
function setAuditContext(request) {
    // Implementación temporal
    console.log('Setting audit context for:', request.url);
}
function clearAuditContext() {
    // Implementación temporal
    console.log('Clearing audit context');
}
function registerAuditMiddleware(prisma) {
    // Implementación temporal
    console.log('Audit middleware registered');
}
async function auditContextMiddleware(request, reply) {
    // Implementación temporal
    setAuditContext(request);
    reply.addHook('onSend', async () => {
        clearAuditContext();
    });
}
