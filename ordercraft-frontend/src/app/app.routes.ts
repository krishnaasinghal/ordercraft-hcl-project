import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    loadComponent: () => import('./features/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/orders/order-list/order-list.component').then(m => m.OrderListComponent)
      },
      {
        path: 'orders/new',
        loadComponent: () => import('./features/orders/order-form/order-form.component').then(m => m.OrderFormComponent)
      },
      {
        path: 'orders/edit/:id',
        loadComponent: () => import('./features/orders/order-form/order-form.component').then(m => m.OrderFormComponent)
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./features/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'bom',
        loadComponent: () => import('./features/bom/bom-list/bom-list.component').then(m => m.BomListComponent)
      },
      {
        path: 'bom/new',
        loadComponent: () => import('./features/bom/bom-form/bom-form.component').then(m => m.BomFormComponent)
      },
      {
        path: 'bom/edit/:id',
        loadComponent: () => import('./features/bom/bom-form/bom-form.component').then(m => m.BomFormComponent)
      },
      {
        path: 'purchase-orders',
        loadComponent: () => import('./features/purchase-orders/po-list/po-list.component').then(m => m.PoListComponent)
      },
      {
        path: 'purchase-orders/:id',
        loadComponent: () => import('./features/purchase-orders/po-detail/po-detail.component').then(m => m.PoDetailComponent)
      },
      {
        path: 'invoices',
        loadComponent: () => import('./features/invoices/invoice-list/invoice-list.component').then(m => m.InvoiceListComponent)
      },
      {
        path: 'invoices/:id',
        loadComponent: () => import('./features/invoices/invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./features/payments/payment-list/payment-list.component').then(m => m.PaymentListComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/customers/customer-list/customer-list.component').then(m => m.CustomerListComponent)
      },
      {
        path: 'suppliers',
        loadComponent: () => import('./features/suppliers/supplier-list/supplier-list.component').then(m => m.SupplierListComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
