import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '~/app/core/services/event.service';
import { IEvent } from '../../../core/models/Event.model';

// @Component({
//   selector: 'app-event-details',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   templateUrl: './event-details.html',
//   styleUrls: ['./event-details.css']
// })
// export class EventDetailsComponent implements OnInit {
//   event: IEvent | null = null;

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private eventService: EventService,
//     private authService: AuthService,
//     private reservationService: ReservationService,
//     private orderService: OrderService,
//     private paymentService: PaymentService
//   ) {}

//   ngOnInit(): void {
//     const id = this.route.snapshot.paramMap.get('id');
//     if (id) {
//       this.eventService.getEventById(id).subscribe({
//         next: (res) => {
//           if (res.success) {
//             this.event = res.data;
//           }
//         },
//         error: (err) => console.error(err)
//       });
//     }
//   }

//   // ✅ Getters que expone al template
//   get isLoggedIn(): boolean {
//     return this.authService.isAuthenticated();
//   }

//   get canReserve(): boolean {
//     const user = this.authService.getCurrentUser();
//     return this.isLoggedIn && user?.role?.toLowerCase() === 'vip';
//   }

//   get canBuy(): boolean {
//     return this.isLoggedIn;
//   }

//   onBuy(event: IEvent): void {
//     console.log('Comprar evento:', event);
//   }

//   onReserve(event: IEvent): void {
//     console.log('Reservar evento:', event);
//   }
// }
@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-details.html',
  styleUrls: ['./event-details.css']
})
export class EventDetailComponent implements OnInit {
  @Input() event!: IEvent;

  constructor(private ticketService: TicketService,private route: ActivatedRoute, private authService: AuthService,  private router: Router,
    private eventService: EventService,
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

  get isLoggedIn(): boolean {
    return !!this.authService.isAuthenticated();
  }

  get isVip(): boolean {
    const user = this.authService.getCurrentUser();
    return user ? ['vip', 'VIP'].includes(user.role) : false;
  }

  get canBuy(): boolean {
    return this.isLoggedIn;
  }

  get canReserve(): boolean {
    return this.isLoggedIn && this.isVip;
  }

  async buy(): Promise<void> {
    if (!this.event || !this.event.id) return;
    const quantity = await this.ticketService.selectQuantityModal(this.event.name);
    if (quantity != null) await this.ticketService.processPurchase(this.event.id, quantity);
  }

  async reserve(): Promise<void> {
    if (!this.event || !this.event.id) return;
    const quantity = await this.ticketService.selectQuantityModal(this.event.name, true);
    if (quantity != null) await this.ticketService.processReservation(this.event.id, quantity);
  }
}
