import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ApprovalService {
  private readonly adminServiceUrl = 'http://localhost:3003/api/approvals';

  async createApprovalRequest(data: {
    resourceType: 'RESTAURANT' | 'TRIP' | 'PRODUCT';
    resourceId: string;
    resourceName: string;
    companyId: string;
    companyName: string;
    requestedBy: string;
    metadata?: any;
  }) {
    try {
      console.log('[APPROVAL] Creando solicitud de aprobación:', data);

      // Obtener token de admin (necesitamos autenticación para crear aprobaciones)
      // Por ahora usamos un token de sistema, en producción esto debería ser más seguro
      const loginResponse = await axios.post('http://localhost:3003/api/auth/login', {
        email: 'voro.super@ticketing.com',
        password: 'Voro123!'
      });

      const token = loginResponse.data.token;

      const response = await axios.post(
        this.adminServiceUrl,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('[APPROVAL] Solicitud creada exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[APPROVAL] Error creando solicitud:', error.response?.data || error.message);
      throw new HttpException(
        'Error al crear solicitud de aprobación',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async checkApprovalStatus(resourceId: string): Promise<any> {
    try {
      const loginResponse = await axios.post('http://localhost:3003/api/auth/login', {
        email: 'voro.super@ticketing.com',
        password: 'Voro123!'
      });

      const token = loginResponse.data.token;

      const response = await axios.get(
        `${this.adminServiceUrl}?resourceId=${resourceId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data.approvals[0] || null;
    } catch (error: any) {
      console.error('[APPROVAL] Error verificando estado:', error.message);
      return null;
    }
  }
}
