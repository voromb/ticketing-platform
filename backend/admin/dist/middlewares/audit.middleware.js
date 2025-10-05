"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuditContext = setAuditContext;
exports.clearAuditContext = clearAuditContext;
exports.registerAuditMiddleware = registerAuditMiddleware;
exports.auditContextMiddleware = auditContextMiddleware;
function setAuditContext(request) {
    console.log('Setting audit context for:', request.url);
}
function clearAuditContext() {
    console.log('Clearing audit context');
}
function registerAuditMiddleware(prisma) {
    console.log('Audit middleware registered');
}
async function auditContextMiddleware(request, reply) {
    setAuditContext(request);
    reply.addHook('onSend', async () => {
        clearAuditContext();
    });
}
