import { PrismaClient, Prisma } from '@prisma/client';
import { FastifyRequest } from 'fastify';

// Lista de modelos que queremos auditar
const AUDITED_MODELS = ['Event', 'Venue', 'Admin', 'PriceCategory'];

// Acciones que queremos registrar
const AUDITED_ACTIONS = ['create', 'update', 'delete', 'upsert'];

interface AuditContext {
    adminId?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
}

// Contexto global para la auditoría (se establece en cada request)
let auditContext: AuditContext = {};

/**
 * Establece el contexto de auditoría para el request actual
 */
export function setAuditContext(request: FastifyRequest) {
    auditContext = {
        adminId: request.user?.id,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        sessionId: request.id,
    };
}

/**
 * Limpia el contexto de auditoría
 */
export function clearAuditContext() {
    auditContext = {};
}

/**
 * Registra un middleware de auditoría en Prisma
 */
export function registerAuditMiddleware(prisma: PrismaClient) {
    prisma.$use(async (params, next) => {
        // Ejecutar la operación original
        const result = await next(params);

        // Si la operación es de un modelo auditado y una acción auditada
        if (
            params.model &&
            AUDITED_MODELS.includes(params.model) &&
            AUDITED_ACTIONS.includes(params.action)
        ) {
            try {
                await createAuditLog(prisma, params, result);
            } catch (error) {
                // Log del error pero no interrumpir la operación
                console.error('Error creando log de auditoría:', error);
            }
        }

        return result;
    });
}

/**
 * Crea un registro de auditoría
 */
async function createAuditLog(prisma: PrismaClient, params: Prisma.MiddlewareParams, result: any) {
    // No auditar las operaciones en la tabla AuditLog para evitar recursión
    if (params.model === 'AuditLog') return;

    // Si no hay contexto de admin, no registrar (operaciones del sistema)
    if (!auditContext.adminId) return;

    const { model, action, args } = params;

    let recordId: string;
    let oldValue: any = null;
    let newValue: any = null;

    // Determinar el ID del registro afectado
    switch (action) {
        case 'create':
            recordId = result.id;
            newValue = result;
            break;

        case 'update':
        case 'delete':
            recordId = args.where?.id || result.id;
            // Para update, obtener el valor anterior si es necesario
            if (action === 'update') {
                // Obtener el registro anterior
                const modelLower = model!.charAt(0).toLowerCase() + model!.slice(1);
                const findUnique = (prisma as any)[modelLower].findUnique;
                if (findUnique) {
                    oldValue = await findUnique({
                        where: { id: recordId },
                    }).catch(() => null);
                }
                newValue = result;
            } else {
                oldValue = result;
            }
            break;

        case 'upsert':
            recordId = result.id;
            // En upsert, determinar si fue create o update
            const wasCreated = !args.update;
            if (!wasCreated) {
                const modelLower = model!.charAt(0).toLowerCase() + model!.slice(1);
                const findUnique = (prisma as any)[modelLower].findUnique;
                if (findUnique) {
                    oldValue = await findUnique({
                        where: { id: recordId },
                    }).catch(() => null);
                }
            }
            newValue = result;
            break;

        default:
            return;
    }

    // Limpiar datos sensibles
    if (oldValue?.password) delete oldValue.password;
    if (newValue?.password) delete newValue.password;

    // Crear el registro de auditoría
    await prisma.auditLog.create({
        data: {
            tableName: model!,
            recordId,
            action: action.toUpperCase(),
            oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
            newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
            adminId: auditContext.adminId!,
            ipAddress: auditContext.ipAddress,
            userAgent: auditContext.userAgent,
            sessionId: auditContext.sessionId,
            eventId: model === 'Event' ? recordId : undefined,
        },
    });
}

/**
 * Middleware de Fastify para establecer contexto de auditoría
 */
export async function auditContextMiddleware(request: FastifyRequest, reply: any) {
    // Establecer contexto al inicio del request
    setAuditContext(request);

    // Limpiar contexto al finalizar
    reply.addHook('onSend', async () => {
        clearAuditContext();
    });
}
