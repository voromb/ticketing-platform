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
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('PERFORMANCE');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage();

    return next.handle().pipe(
      tap(() => {
        const endTime = process.hrtime.bigint();
        const endMemory = process.memoryUsage();
        
        const executionTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

        const performanceData = {
          timestamp: new Date().toISOString(),
          method,
          url,
          executionTime: `${executionTime.toFixed(2)}ms`,
          memoryUsage: {
            before: `${(startMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
            after: `${(endMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
            delta: `${(memoryDelta / 1024 / 1024).toFixed(2)}MB`
          }
        };

        // Log solo si es lento (>1000ms) o usa mucha memoria (>10MB)
        if (executionTime > 1000 || Math.abs(memoryDelta) > 10 * 1024 * 1024) {
          this.logger.warn(
            `[PERFORMANCE] SLOW OPERATION: ${method} ${url}`,
            performanceData,
          );
        } else if (executionTime > 500) {
          this.logger.log(`🐌 MODERATE DELAY: ${method} ${url}`, performanceData);
        }

        // Log detallado para endpoints críticos
        if (this.isCriticalEndpoint(url)) {
          this.logger.log(`📊 CRITICAL ENDPOINT: ${method} ${url}`, performanceData);
        }
      })
    );
  }

  private isCriticalEndpoint(url: string): boolean {
    const criticalEndpoints = [
      '/api/auth/login',
      '/api/approval/decision',
      '/api/travel/bookings',
      '/api/restaurant/reservations',
      '/api/merchandising/orders'
    ];

    return criticalEndpoints.some(endpoint => url.includes(endpoint));
  }
}
