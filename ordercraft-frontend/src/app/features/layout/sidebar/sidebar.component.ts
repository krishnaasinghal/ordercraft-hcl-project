import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule, MatDividerModule],
  template: `
    <div class="sidebar-container">
      <div class="brand">
        <mat-icon class="brand-icon">factory</mat-icon>
        <div class="brand-text">
          <span class="brand-name">OrderCraft</span>
          <span class="brand-sub">Manufacturing OMS</span>
        </div>
      </div>

      <mat-divider class="sidebar-divider"></mat-divider>

      <nav class="nav-section">
        <div class="nav-category">CORE OPERATIONS</div>
        <a *ngFor="let item of mainNav"
           [routerLink]="item.route"
           routerLinkActive="active"
           class="nav-link">
          <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
          <span class="nav-label">{{ item.label }}</span>
        </a>

        <div class="nav-category">PROCUREMENT & FINANCE</div>
        <a *ngFor="let item of financeNav"
           [routerLink]="item.route"
           routerLinkActive="active"
           class="nav-link">
          <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
          <span class="nav-label">{{ item.label }}</span>
        </a>

        <div class="nav-category">MASTER DATA</div>
        <a *ngFor="let item of masterNav"
           [routerLink]="item.route"
           routerLinkActive="active"
           class="nav-link">
          <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
          <span class="nav-label">{{ item.label }}</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="system-status">
          <span class="status-dot"></span>
          <span>Order-to-Cash Online</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    .sidebar-container {
      width: 260px;
      height: 100%;
      background: #0f172a;
      color: #94a3b8;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 8px rgba(0,0,0,0.15);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 18px;
      background: #090e1a;
    }
    .brand-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #00b4d8;
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-name {
      color: #f8fafc;
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .brand-sub {
      font-size: 0.72rem;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .sidebar-divider {
      border-color: #1e293b !important;
    }
    .nav-section {
      flex: 1;
      padding: 16px 10px;
      overflow-y: auto;
    }
    .nav-category {
      font-size: 0.68rem;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 1px;
      padding: 12px 12px 6px;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 6px;
      color: #cbd5e1;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
      margin-bottom: 2px;
      transition: all 0.15s ease;
    }
    .nav-link:hover {
      background: rgba(255, 255, 255, 0.06);
      color: #f1f5f9;
    }
    .nav-link.active {
      background: #0284c7;
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(2, 132, 199, 0.4);
    }
    .nav-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .sidebar-footer {
      padding: 14px 18px;
      background: #090e1a;
      border-top: 1px solid #1e293b;
    }
    .system-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.75rem;
      color: #10b981;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 6px #10b981;
    }
  `]
})
export class SidebarComponent {
  mainNav: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Manufacturing Orders', icon: 'precision_manufacturing', route: '/orders' },
    { label: 'Bill of Materials', icon: 'account_tree', route: '/bom' },
    { label: 'Products', icon: 'inventory_2', route: '/products' },
  ];

  financeNav: NavItem[] = [
    { label: 'Purchase Orders', icon: 'shopping_cart', route: '/purchase-orders' },
    { label: 'Invoices', icon: 'receipt_long', route: '/invoices' },
    { label: 'Payments', icon: 'payments', route: '/payments' },
  ];

  masterNav: NavItem[] = [
    { label: 'Customers', icon: 'business', route: '/customers' },
    { label: 'Suppliers', icon: 'local_shipping', route: '/suppliers' },
  ];
}
