import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';
import { IEvent } from '../../../core/models/Event.model';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-details.html',
  styleUrls: ['./event-details.css']
})
export class EventDetailsComponent implements OnInit {
  event: IEvent | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private authService: AuthService,
    private reservationService: ReservationService,
    private orderService: OrderService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventService.getEventById(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.event = res.data;
          }
        },
        error: (err) => console.error(err)
      });
    }
  }

  // ✅ Getters que expone al template
  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get canReserve(): boolean {
    const user = this.authService.getCurrentUser();
    return this.isLoggedIn && user?.role?.toLowerCase() === 'vip';
  }

  get canBuy(): boolean {
    return this.isLoggedIn;
  }

  onBuy(event: IEvent): void {
    console.log('Comprar evento:', event);
  }

  onReserve(event: IEvent): void {
    console.log('Reservar evento:', event);
  }
}
