import { Routes } from '@angular/router';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, //*Hi ha que cambiar a futur al home */
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
    path: 'events',
    loadComponent: () =>
      import('./shared/components/events/events.component').then((m) => m.EventsComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./shared/components/profile/profile.component').then((m) => m.ProfileComponent),
  },
  // { estan comentades perque encara no estan fets els components
  //   path: 'admin',
  //   loadComponent: () =>
  //     import('./components/admin/admin.component').then((m) => m.AdminComponent),
  // },
  // {
  //   path: 'company',
  //   loadComponent: () =>
  //     import('./components/company/company.component').then((m) => m.CompanyComponent),
  // },
];