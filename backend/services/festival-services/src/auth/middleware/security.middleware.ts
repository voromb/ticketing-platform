import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Configurar headers de seguridad
    this.setSecurityHeaders(res);
    
    // Validar y sanitizar request
    this.validateRequest(req);
    
    // Rate limiting básico (en memoria)
    if (this.isRateLimited(req)) {
      this.logger.warn(`🚫 RATE LIMIT: ${req.ip} - ${req.method} ${req.url}`);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: 60
      });
    }

    // Log de seguridad para requests sospechosos
    if (this.isSuspiciousRequest(req)) {
      this.logger.warn(`⚠️ SUSPICIOUS REQUEST: ${req.ip} - ${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        url: req.url,
        method: req.method,
        headers: this.sanitizeHeaders(req.headers)
      });
    }

    next();
  }

  private setSecurityHeaders(res: Response): void {
    // Prevenir XSS
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // HSTS (solo en producción)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    // CSP básico
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    
    // Ocultar información del servidor
    res.removeHeader('X-Powered-By');
  }

  private validateRequest(req: Request): void {
    // Sanitizar URL
    if (req.url.includes('../') || req.url.includes('..\\')) {
      this.logger.warn(`🚫 PATH TRAVERSAL ATTEMPT: ${req.ip} - ${req.url}`);
      throw new Error('Invalid path');
    }

    // Validar tamaño del body
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > 10 * 1024 * 1024) { // 10MB limit
      this.logger.warn(`🚫 LARGE PAYLOAD: ${req.ip} - ${contentLength} bytes`);
      throw new Error('Payload too large');
    }

    // Validar headers sospechosos
    const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip'];
    for (const header of suspiciousHeaders) {
      if (req.headers[header] && typeof req.headers[header] === 'string') {
        const value = req.headers[header] as string;
        if (value.includes('<script>') || value.includes('javascript:')) {
          this.logger.warn(`🚫 MALICIOUS HEADER: ${req.ip} - ${header}: ${value}`);
          delete req.headers[header];
        }
      }
    }
  }

  private isRateLimited(req: Request): boolean {
    // Rate limiting simple en memoria (en producción usar Redis)
    const key = `${req.ip}:${req.method}:${req.url}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minuto
    const maxRequests = 100; // 100 requests por minuto

    if (!global.rateLimitStore) {
      global.rateLimitStore = new Map();
    }

    const requests = global.rateLimitStore.get(key) || [];
    const validRequests = requests.filter((time: number) => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return true;
    }

    validRequests.push(now);
    global.rateLimitStore.set(key, validRequests);
    
    return false;
  }

  private isSuspiciousRequest(req: Request): boolean {
    const suspiciousPatterns = [
      // SQL Injection patterns
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bDROP\b)/i,
      // XSS patterns
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
      // Path traversal
      /\.\.[\/\\]/,
      // Command injection
      /[;&|`$]/,
    ];

    const checkString = `${req.url} ${JSON.stringify(req.query)} ${JSON.stringify(req.body)}`;
    
    return suspiciousPatterns.some(pattern => pattern.test(checkString));
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    
    // Ocultar headers sensibles en logs
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
}

// Declarar el tipo global para TypeScript
declare global {
  var rateLimitStore: Map<string, number[]>;
}
