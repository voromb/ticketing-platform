import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';
import { ReservationService } from './reservation.service';

@Injectable({ providedIn: 'root' })
export class TicketService {

  constructor(
    private http: HttpClient,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private reservationService: ReservationService
  ) {}

  /** Modal para seleccionar cantidad */
  async selectQuantityModal(eventName: string, isReservation = false): Promise<number | null> {
    const result = await Swal.fire({
      title: isReservation ? `Reservar entradas VIP` : `Comprar entradas para ${eventName}`,
      html: `
        <div class="text-start">
          <p class="mb-3">Selecciona la cantidad de entradas:</p>
          <input type="number" id="quantity" class="swal2-input" value="1" min="1" max="10" placeholder="Cantidad">
          ${isReservation ? `<div class="alert alert-warning mt-3">⏰ La reserva expirará en 15 minutos</div>` : ''}
          <p class="text-muted small mt-2">Nota: La selección de localidad se implementará próximamente</p>
        </div>
      `,
      icon: isReservation ? 'info' : 'question',
      showCancelButton: true,
      confirmButtonText: isReservation ? 'Reservar' : 'Continuar al pago',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: isReservation ? '#ffc107' : '#dc3545',
      preConfirm: () => {
        const quantity = (document.getElementById('quantity') as HTMLInputElement).value;
        if (!quantity || parseInt(quantity) < 1) {
          Swal.showValidationMessage('Debes seleccionar al menos 1 entrada');
          return false;
        }
        return parseInt(quantity);
      }
    });

    return result.isConfirmed ? result.value : null;
  }

  /** Obtener primera localidad disponible */
  private async getFirstLocality(eventId: string, token?: string): Promise<string> {
    const response: any = await this.http.get(`${environment.apiUrl}/events/${eventId}/localities`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }).toPromise();

    if (!response.success || !response.data?.length) throw new Error('No hay localidades disponibles');
    return response.data[0].id;
  }

  /** Procesar compra */
  async processPurchase(eventId: string, quantity: number) {
    const token = localStorage.getItem('token');
    try {
      Swal.fire({ title: 'Cargando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        if (!eventId) {
    Swal.fire('Error', 'Evento inválido', 'error');
    return;
    }

    const localityId = await this.getFirstLocality(eventId, token ?? undefined);


      Swal.fire({ title: 'Procesando compra...', text: 'Creando orden', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const orderResp: any = await this.orderService.createOrder(eventId, localityId, quantity).toPromise();
      if (!orderResp.success) throw new Error(orderResp.error || 'Error al crear orden');

      const paymentResp: any = await this.paymentService.createCheckoutSession(orderResp.data.id).toPromise();
      if (!paymentResp.success || !paymentResp.data.url) throw new Error('No se pudo crear la sesión de pago');

      Swal.close();
      window.location.href = paymentResp.data.url;

    } catch (error: any) {
      Swal.fire('Error', error.message || 'Error al procesar la compra', 'error');
    }
  }

  /** Procesar reserva */
  async processReservation(eventId: string, quantity: number) {
    const token = localStorage.getItem('token');
    try {
      Swal.fire({ title: 'Cargando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            if (!eventId) {
        Swal.fire('Error', 'Evento inválido', 'error');
        return;
        }

        const localityId = await this.getFirstLocality(eventId, token ?? undefined);


      Swal.fire({ title: 'Creando reserva...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const resResp: any = await this.reservationService.createReservation(eventId, localityId, quantity).toPromise();
      if (!resResp.success) throw new Error(resResp.error || 'Error al crear la reserva');

      Swal.fire({
        icon: 'success',
        title: '¡Reserva creada!',
        html: `
          <p><strong>Cantidad:</strong> ${quantity} entrada(s)</p>
          <p class="text-warning"><strong>⏰ Expira en 15 minutos</strong></p>
          <p class="text-muted small">Puedes ver tus reservas en tu panel de usuario</p>
        `,
        confirmButtonText: 'Ver mis reservas',
        showCancelButton: true,
        cancelButtonText: 'Continuar navegando'
      }).then(result => {
        if (result.isConfirmed) window.location.href = '/profile';
      });

    } catch (error: any) {
      Swal.fire('Error', error.message || 'Error al crear la reserva', 'error');
    }
  }
}
