import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { ReservationService } from '../../core/services/reservation.service';
import { OrderService } from '../../core/services/order.service';
import Swal from 'sweetalert2';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  user: any = null;
  activeTab = 'profile';
  loading = false;
  
  // Formularios
  profileForm: FormGroup;
  changePasswordForm: FormGroup;
  showPasswordForm = false;

  // Reservas y órdenes reales
  myReservations: any[] = [];
  myOrders: any[] = [];
  loadingReservations = false;
  loadingOrders = false;

  // Tickets reales desde órdenes completadas
  myTickets: any[] = [];

  // Subscription para detectar navegación
  private routerSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private reservationService: ReservationService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {
    this.profileForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      phone: [''],
      address: [''],
      city: [''],
      country: ['España'],
      dateOfBirth: ['']
    });

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadUserData();
    this.loadReservations();
    this.loadOrders();
    
    // Escuchar navegaciones para recargar datos
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/profile' || event.url.startsWith('/profile')) {
          console.log('🔄 Navegación detectada a perfil, recargando datos...');
          this.refreshData();
        }
      });
    
    // Forzar detección de cambios
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // Método para refrescar datos (llamado desde otros componentes)
  refreshData() {
    console.log('🔄 Refrescando datos del perfil...');
    this.loadReservations();
    this.loadOrders();
  }

  // Método helper para contar órdenes completadas
  getCompletedOrdersCount(): number {
    return this.myOrders.filter(order => order.status === 'PAID' || order.status === 'COMPLETED').length;
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  loadUserData() {
    this.user = this.authService.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    // Cargar datos adicionales del perfil si están disponibles
    this.profileForm.patchValue({
      firstName: this.user.firstName || '',
      lastName: this.user.lastName || '',
      phone: this.user.phone || '',
      address: this.user.address || '',
      city: this.user.city || '',
      country: this.user.country || 'España',
      dateOfBirth: this.user.dateOfBirth || ''
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  isVipUser(): boolean {
    return this.user?.role === 'VIP' || this.user?.role === 'vip';
  }

  getUserInitials(): string {
    if (this.user?.firstName && this.user?.lastName) {
      return `${this.user.firstName.charAt(0)}${this.user.lastName.charAt(0)}`.toUpperCase();
    }
    return this.user?.email?.charAt(0).toUpperCase() || 'U';
  }

  getRoleDisplayName(): string {
    if (this.isVipUser()) return 'VIP';
    return 'Usuario';
  }

  getRoleBadgeClass(): string {
    if (this.isVipUser()) return 'bg-amber-100 text-amber-800';
    return 'bg-gray-100 text-gray-800';
  }

  updateProfile() {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.loading = true;
    
    // Simular actualización del perfil
    setTimeout(() => {
      this.loading = false;
      
      // Actualizar datos del usuario
      const updatedUser = { ...this.user, ...this.profileForm.value };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      this.user = updatedUser;

      Swal.fire({
        icon: 'success',
        title: 'Perfil Actualizado',
        text: 'Tus datos han sido guardados correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    }, 1500);
  }

  togglePasswordForm() {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.changePasswordForm.reset();
    }
  }

  onChangePassword() {
    if (this.changePasswordForm.invalid) {
      this.markFormGroupTouched(this.changePasswordForm);
      return;
    }

    this.loading = true;
    
    // Simular cambio de contraseña
    setTimeout(() => {
      this.loading = false;
      this.changePasswordForm.reset();
      this.showPasswordForm = false;
      
      Swal.fire({
        icon: 'success',
        title: 'Contraseña Actualizada',
        text: 'Tu contraseña ha sido cambiada exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
    }, 2000);
  }

  goToVipInfo() {
    this.router.navigate(['/vip-info']);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendiente';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  loadReservations() {
    if (!this.isVip) return;

    this.loadingReservations = true;
    this.reservationService.getMyReservations().subscribe({
      next: (response) => {
        if (response.success) {
          this.myReservations = response.data;
        }
        this.loadingReservations = false;
        setTimeout(() => this.cdr.detectChanges(), 100);
      },
      error: (error) => {
        console.error('Error cargando reservas:', error);
        this.loadingReservations = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadOrders() {
    console.log('🔄 Cargando órdenes...');
    this.loadingOrders = true;
    this.orderService.getMyOrders().subscribe({
      next: (response) => {
        console.log('✅ Respuesta de órdenes:', response);
        if (response.success) {
          this.myOrders = response.data;
          console.log(`📦 Total de órdenes: ${this.myOrders.length}`);
          
          // Extraer tickets de órdenes pagadas (PAID o COMPLETED)
          this.myTickets = [];
          this.myOrders.forEach(order => {
            console.log(`📋 Orden ${order.id}: status=${order.status}, tickets=${order.tickets?.length || 0}`);
            if ((order.status === 'PAID' || order.status === 'COMPLETED') && order.tickets && order.tickets.length > 0) {
              order.tickets.forEach((ticket: any) => {
                this.myTickets.push({
                  id: ticket.id,
                  ticketCode: ticket.ticketCode,
                  qrCode: ticket.qrCode,
                  status: ticket.status,
                  eventName: order.event?.name || 'Evento',
                  eventDate: order.event?.eventDate,
                  localityName: order.locality?.name || 'General',
                  orderId: order.id,
                  createdAt: ticket.createdAt
                });
              });
            }
          });
          console.log(`🎫 Total de tickets extraídos: ${this.myTickets.length}`);
        }
        this.loadingOrders = false;
        setTimeout(() => this.cdr.detectChanges(), 100);
      },
      error: (error) => {
        console.error('❌ Error cargando órdenes:', error);
        console.error('Detalles:', error.message);
        this.loadingOrders = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelReservation(reservationId: string) {
    Swal.fire({
      title: '¿Cancelar reserva?',
      text: 'Las entradas serán liberadas inmediatamente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
      confirmButtonColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        this.reservationService.cancelReservation(reservationId).subscribe({
          next: (response) => {
            if (response.success) {
              Swal.fire('Cancelada', 'La reserva ha sido cancelada', 'success');
              this.loadReservations();
            }
          },
          error: (error) => {
            Swal.fire('Error', error.error?.error || 'Error al cancelar', 'error');
          }
        });
      }
    });
  }

  purchaseReservation(reservation: any) {
    Swal.fire({
      title: '¿Comprar esta reserva?',
      html: `
        <div class="text-start">
          <p><strong>Evento:</strong> ${reservation.event.name}</p>
          <p><strong>Cantidad:</strong> ${reservation.quantity} entrada(s)</p>
          <p><strong>Precio:</strong> ${(reservation.locality.price * reservation.quantity).toFixed(2)}€</p>
          <p class="text-success"><strong>Descuento VIP:</strong> 10%</p>
          <p><strong>Total:</strong> ${(reservation.locality.price * reservation.quantity * 0.9).toFixed(2)}€</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Continuar al pago',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Procesando...',
          text: 'Creando orden de compra',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.orderService.createOrder(reservation.eventId, reservation.localityId, reservation.quantity, reservation.id).subscribe({
          next: (response) => {
            if (response.success) {
              const order = response.data;
              
              this.http.post<any>('http://localhost:3003/api/payments/create-checkout', 
                { orderId: order.id },
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
              ).subscribe({
                next: (paymentResponse) => {
                  if (paymentResponse.success && paymentResponse.data.url) {
                    Swal.close();
                    window.location.href = paymentResponse.data.url;
                  } else {
                    Swal.fire('Error', 'No se pudo crear la sesión de pago', 'error');
                  }
                },
                error: (error) => {
                  console.error('Error creando sesión:', error);
                  Swal.fire('Error', 'Error al procesar el pago', 'error');
                }
              });
            } else {
              Swal.fire('Error', response.error || 'No se pudo crear la orden', 'error');
            }
          },
          error: (error) => {
            console.error('Error creando orden:', error);
            Swal.fire('Error', error.error?.error || 'Error al crear la orden', 'error');
          }
        });
      }
    });
  }

  getTimeLeft(reservation: any): string {
    if (!reservation.timeLeftSeconds || reservation.timeLeftSeconds <= 0) {
      return 'Expirada';
    }
    
    const minutes = Math.floor(reservation.timeLeftSeconds / 60);
    const seconds = reservation.timeLeftSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  get isVip(): boolean {
    return this.user && ['vip', 'VIP'].includes(this.user.role);
  }
}
