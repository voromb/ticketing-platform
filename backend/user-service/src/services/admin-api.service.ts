import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { SERVICES_CONFIG } from '../config/services';

export interface AdminEvent {
  id: string;
  name: string;
  description?: string;
  eventDate: string;
  saleStartDate: string;
  saleEndDate: string;
  totalCapacity: number;
  availableTickets: number;
  minPrice: number;
  maxPrice: number;
  status: string;
  category: string;
  subcategory: string;
  venue: {
    id: string;
    name: string;
    city: string;
    capacity: number;
    address: string;
  };
}

export interface AdminVenue {
  id: string;
  name: string;
  capacity: number;
  address: string;
  city: string;
  state?: string;
  country: string;
  description?: string;
  isActive: boolean;
}

export class AdminApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.ADMIN_SERVICE_URL || 'http://localhost:3003',
      timeout: 5000, // 5 segundos timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[API Call] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[API Call Error]', error);
        return Promise.reject(error);
      }
    );

    // Interceptor para manejo de respuestas
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API Response] ${response.status} - ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`[API Error] ${error.response?.status} - ${error.config?.url}`, error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Obtener todos los eventos disponibles (usando endpoint público)
   */
  async getEvents(): Promise<AdminEvent[]> {
    try {
      const response: AxiosResponse<{ success: boolean; data: AdminEvent[] }> = 
        await this.client.get(SERVICES_CONFIG.ADMIN_SERVICE.ENDPOINTS.PUBLIC_EVENTS);
      
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error fetching events from admin service:', error.message);
      throw new Error(`Failed to fetch events: ${error.message}`);
    }
  }

  /**
   * Obtener un evento específico por ID (usando endpoint público)
   */
  async getEventById(eventId: string): Promise<AdminEvent | null> {
    try {
      const response: AxiosResponse<{ success: boolean; data: AdminEvent }> = 
        await this.client.get(`${SERVICES_CONFIG.ADMIN_SERVICE.ENDPOINTS.PUBLIC_EVENTS}/${eventId}`);
      
      return response.data.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error(`Error fetching event ${eventId} from admin service:`, error.message);
      throw new Error(`Failed to fetch event: ${error.message}`);
    }
  }

  /**
   * Obtener todos los venues disponibles
   */
  async getVenues(): Promise<AdminVenue[]> {
    try {
      const response: AxiosResponse<{ venues: AdminVenue[] }> = 
        await this.client.get(`${SERVICES_CONFIG.ADMIN_SERVICE.ENDPOINTS.VENUES}?isActive=true`);
      
      return response.data.venues || [];
    } catch (error: any) {
      console.error('Error fetching venues from admin service:', error.message);
      throw new Error(`Failed to fetch venues: ${error.message}`);
    }
  }

  /**
   * Verificar disponibilidad de un evento antes de crear ticket
   */
  async checkEventAvailability(eventId: string, requestedTickets: number = 1): Promise<boolean> {
    try {
      const event = await this.getEventById(eventId);
      
      if (!event) {
        return false;
      }

      // Verificar si el evento está activo y tiene tickets disponibles
      return event.availableTickets >= requestedTickets && 
             event.status === 'ACTIVE' &&
             new Date(event.saleStartDate) <= new Date() &&
             new Date(event.saleEndDate) >= new Date();
    } catch (error: any) {
      console.error(`Error checking availability for event ${eventId}:`, error.message);
      return false;
    }
  }

  /**
   * Actualizar disponibilidad de tickets después de una compra
   * (Este método requeriría autenticación del admin service)
   */
  async updateEventAvailability(eventId: string, ticketsSold: number, adminToken?: string): Promise<boolean> {
    try {
      const headers: any = {};
      if (adminToken) {
        headers.Authorization = `Bearer ${adminToken}`;
      }

      const response = await this.client.patch(
        `${SERVICES_CONFIG.ADMIN_SERVICE.ENDPOINTS.EVENTS}/${eventId}`,
        {
          // Decrementar tickets disponibles
          availableTickets: { decrement: ticketsSold }
        },
        { headers }
      );

      return response.status === 200;
    } catch (error: any) {
      console.error(`Error updating availability for event ${eventId}:`, error.message);
      return false;
    }
  }

  /**
   * Verificar salud del admin service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get(SERVICES_CONFIG.ADMIN_SERVICE.ENDPOINTS.HEALTH);
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('Admin service health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const adminApiService = new AdminApiService();
