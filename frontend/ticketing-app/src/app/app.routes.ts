import { Routes } from '@angular/router';
import { AdminGuard } from './core/guards/admin.guard';
import { SuperAdminGuard } from './core/guards/super-admin.guard';


export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, //*Hi ha que cambiar a futur al home */
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
    path: 'profile',
    loadComponent: () =>
      import('./shared/components/profile/profile.component').then((m) => m.ProfileComponent),
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
        path: 'settings',
        loadComponent: () =>
          import('./pages/admin/settings/settings.component').then((m) => m.SettingsComponent),
        canActivate: [SuperAdminGuard],
      }
    ]
  },
];