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
    path: 'details',
    loadComponent: () =>
     import('./pages/detail-event/detail-event').then((m) => m.DetailEvent),
  },
  {
    path: 'shop',
    loadComponent: () =>
      import('./pages/shop/shop').then((m) => m.Shop),
  },
  {
    path: 'venues/:id',
    loadComponent: () => import('./pages/venue-detail/venue-detail').then(m => m.VenueDetail),
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
        path: 'settings',
        loadComponent: () =>
          import('./pages/admin/settings/settings.component').then((m) => m.SettingsComponent),
        canActivate: [SuperAdminGuard],
      }
    ]
  },
];