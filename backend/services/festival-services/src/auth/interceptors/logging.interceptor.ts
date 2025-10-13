import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const user = request.user || null;
    
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    // Log de entrada
    const logData = {
      timestamp,
      method,
      url,
      ip,
      userAgent,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role
      } : null,
      body: this.sanitizeBody(request.body),
      query: request.query,
      params: request.params,
    };

    this.logger.log(`📥 INCOMING REQUEST: ${method} ${url}`, {
      ...logData,
      type: 'REQUEST'
    });

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        this.logger.log(`📤 RESPONSE: ${method} ${url} - ${statusCode} (${duration}ms)`, {
          timestamp: new Date().toISOString(),
          method,
          url,
          statusCode,
          duration,
          user: user ? user.email : 'Anonymous',
          responseSize: JSON.stringify(data).length,
          type: 'RESPONSE'
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;

        this.logger.error(`❌ ERROR: ${method} ${url} - ${statusCode} (${duration}ms)`, {
          timestamp: new Date().toISOString(),
          method,
          url,
          statusCode,
          duration,
          user: user ? user.email : 'Anonymous',
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name
          },
          type: 'ERROR'
        });

        return throwError(() => error);
      })
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return null;

    // Crear una copia para no modificar el original
    const sanitized = { ...body };

    // Ocultar campos sensibles
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***HIDDEN***';
      }
    }

    return sanitized;
  }
}
