import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AUDIT');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const user = request.user;

    // Solo auditar operaciones críticas
    if (this.shouldAudit(method, url)) {
      const auditLog = {
        timestamp: new Date().toISOString(),
        action: this.getActionType(method, url),
        resource: this.getResourceType(url),
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.role
        } : { type: 'ANONYMOUS' },
        method,
        url,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        body: this.sanitizeAuditData(request.body),
        params: request.params,
        query: request.query,
      };

      this.logger.warn(`🔍 AUDIT: ${auditLog.action} on ${auditLog.resource}`, auditLog);
    }

    return next.handle().pipe(
      tap((data) => {
        // Log adicional para operaciones exitosas críticas
        if (this.shouldAuditSuccess(method, url)) {
          this.logger.warn(`[AUDIT] AUDIT SUCCESS: ${method} ${url}`, {
            timestamp: new Date().toISOString(),
            user: user ? user.email : 'ANONYMOUS',
            result: 'SUCCESS',
            affectedRecords: Array.isArray(data) ? data.length : 1,
          });
        }
      })
    );
  }

  private shouldAudit(method: string, url: string): boolean {
    // Auditar operaciones críticas
    const criticalOperations = [
      // Autenticación
      '/api/auth/login',
      '/api/auth/register',
      
      // Aprobaciones (todas las operaciones)
      '/api/approval',
      
      // Operaciones de administración
      'POST /api/travel',
      'DELETE /api/travel',
      'POST /api/restaurant',
      'DELETE /api/restaurant',
      'POST /api/merchandising',
      'DELETE /api/merchandising',
      
      // Decisiones de aprobación
      '/decision',
      
      // Confirmaciones y cancelaciones
      '/confirm',
      '/cancel',
    ];

    return criticalOperations.some(pattern => {
      if (pattern.includes(' ')) {
        const [patternMethod, patternUrl] = pattern.split(' ');
        return method === patternMethod && url.includes(patternUrl);
      }
      return url.includes(pattern);
    });
  }

  private shouldAuditSuccess(method: string, url: string): boolean {
    // Auditar éxitos en operaciones muy críticas
    return url.includes('/decision') || 
           url.includes('/confirm') || 
           url.includes('/cancel') ||
           (method === 'POST' && url.includes('/auth/login'));
  }

  private getActionType(method: string, url: string): string {
    if (url.includes('/login')) return 'LOGIN_ATTEMPT';
    if (url.includes('/register')) return 'USER_REGISTRATION';
    if (url.includes('/decision')) return 'APPROVAL_DECISION';
    if (url.includes('/confirm')) return 'CONFIRMATION';
    if (url.includes('/cancel')) return 'CANCELLATION';
    
    switch (method) {
      case 'POST': return 'CREATE';
      case 'PUT':
      case 'PATCH': return 'UPDATE';
      case 'DELETE': return 'DELETE';
      case 'GET': return 'READ';
      default: return 'UNKNOWN';
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('/auth')) return 'AUTHENTICATION';
    if (url.includes('/approval')) return 'APPROVAL';
    if (url.includes('/travel')) return 'TRAVEL';
    if (url.includes('/restaurant')) return 'RESTAURANT';
    if (url.includes('/merchandising')) return 'MERCHANDISING';
    return 'UNKNOWN';
  }

  private sanitizeAuditData(body: any): any {
    if (!body) return null;

    const sanitized = { ...body };
    
    // Campos sensibles para auditoría
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
