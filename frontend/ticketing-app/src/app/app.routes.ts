import { Routes } from '@angular/router';
import { AdminGuard } from './core/guards/admin.guard';
import { SuperAdminGuard } from './core/guards/super-admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./shared/components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./shared/components/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'shop',
    loadComponent: () =>
      import('./pages/shop/shop').then((m) => m.Shop),
  },
  {
    path: 'event/:slug',
    loadComponent: () => import('./pages/detail-event/detail-event').then(m => m.DetailEvent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/user-profile/user-profile.component').then((m) => m.UserProfileComponent),
  },
  {
    path: 'vip-info',
    loadComponent: () =>
      import('./pages/vip-info/vip-info.component').then((m) => m.VipInfoComponent),
  },
  {
    path: 'payment/checkout',
    loadComponent: () =>
      import('./pages/payment-checkout/payment-checkout.component').then((m) => m.PaymentCheckoutComponent),
  },
  // Admin Dashboard Routes
  {
    path: 'admin-dashboard',
    loadComponent: () =>
      import('./pages/admin/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./pages/admin/events/events-list.component').then((m) => m.EventsListComponent),
      },
      {
        path: 'venues',
        loadComponent: () =>
          import('./pages/admin/venues/venues-list.component').then((m) => m.VenuesListComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/admin/users/users-list.component').then((m) => m.UsersListComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./pages/admin/categories/categories-list.component').then((m) => m.CategoriesListComponent),
      },
      {
        path: 'approvals',
        loadComponent: () =>
          import('./pages/admin/approvals/approvals-list.component').then((m) => m.ApprovalsListComponent),
        canActivate: [SuperAdminGuard],
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/admin/settings/settings.component').then((m) => m.SettingsComponent),
        canActivate: [SuperAdminGuard],
      }
    ]
  },
  // Restaurant Admin Routes
  {
    path: 'restaurant-admin',
    loadComponent: () =>
      import('./pages/restaurant-admin/restaurant-layout/restaurant-layout.component').then((m) => m.RestaurantLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/restaurant-admin/restaurant-dashboard/restaurant-dashboard.component').then((m) => m.RestaurantDashboardComponent),
      },
      {
        path: 'list',
        loadComponent: () =>
          import('./pages/restaurant-admin/restaurant-list/restaurant-list.component').then((m) => m.RestaurantListComponent),
      },
      {
        path: 'reservations',
        loadComponent: () =>
          import('./pages/restaurant-admin/restaurant-reservations/restaurant-reservations.component').then((m) => m.RestaurantReservationsComponent),
      }
    ]
  },
  // Travel Admin Routes
  {
    path: 'travel-admin',
    loadComponent: () =>
      import('./pages/travel-admin/travel-layout/travel-layout.component').then((m) => m.TravelLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/travel-admin/travel-dashboard/travel-dashboard.component').then((m) => m.TravelDashboardComponent),
      },
      {
        path: 'list',
        loadComponent: () =>
          import('./pages/travel-admin/travel-list/travel-list.component').then((m) => m.TravelListComponent),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./pages/travel-admin/travel-bookings/travel-bookings.component').then((m) => m.TravelBookingsComponent),
      }
    ]
  },
  // Merchandising Admin Routes
  {
    path: 'merchandising-admin',
    loadComponent: () =>
      import('./pages/merchandising-admin/merchandising-layout/merchandising-layout.component').then((m) => m.MerchandisingLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/merchandising-admin/merchandising-dashboard/merchandising-dashboard.component').then((m) => m.MerchandisingDashboardComponent),
      },
      {
        path: 'list',
        loadComponent: () =>
          import('./pages/merchandising-admin/merchandising-list/merchandising-list.component').then((m) => m.MerchandisingListComponent),
      }
    ]
  },
];