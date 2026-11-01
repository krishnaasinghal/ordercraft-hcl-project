import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderService } from '../../../shared/services/order.service';
import { ORDER_STATUSES, ORDER_PRIORITIES } from '../../../shared/models/order.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    StatusBadgeComponent
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Manufacturing Orders (MO)</h1>
          <p class="page-subtitle">Track end-to-end production runs, scheduling, fulfillment, and BOM material allocation</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/orders/new">
          <mat-icon>add</mat-icon>
          Create Manufacturing Order
        </button>
      </div>

      <div class="filter-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search order # or customer</mat-label>
          <input matInput [(ngModel)]="searchQuery" (keyup.enter)="loadOrders()" placeholder="e.g. MO-2024, Apex...">
          <button mat-icon-button matSuffix (click)="loadOrders()">
            <mat-icon>search</mat-icon>
          </button>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-select">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="selectedStatus" (selectionChange)="loadOrders()">
            <mat-option value="">All Statuses</mat-option>
            <mat-option *ngFor="let s of statuses" [value]="s">{{ s }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-select">
          <mat-label>Priority</mat-label>
          <mat-select [(ngModel)]="selectedPriority" (selectionChange)="loadOrders()">
            <mat-option value="">All Priorities</mat-option>
            <mat-option *ngFor="let p of priorities" [value]="p">{{ p }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!loading" class="table-container app-card">
        <table mat-table [dataSource]="orders" class="w-full">
          <ng-container matColumnDef="orderNumber">
            <th mat-header-cell *matHeaderCellDef>Order Number</th>
            <td mat-cell *matCellDef="let o">
              <a [routerLink]="['/orders', o.id]" class="order-link font-semibold">
                {{ o.orderNumber }}
              </a>
            </td>
          </ng-container>

          <ng-container matColumnDef="customer">
            <th mat-header-cell *matHeaderCellDef>Customer</th>
            <td mat-cell *matCellDef="let o">
              {{ o.customerName || o.customer?.name }}
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Lifecycle Status</th>
            <td mat-cell *matCellDef="let o">
              <app-status-badge [status]="o.status" type="order"></app-status-badge>
            </td>
          </ng-container>

          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef>Priority</th>
            <td mat-cell *matCellDef="let o">
              <span [class]="'priority-chip priority-' + o.priority?.toLowerCase()">
                {{ o.priority }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="dates">
            <th mat-header-cell *matHeaderCellDef>Order Date / Due Date</th>
            <td mat-cell *matCellDef="let o">
              <div>{{ o.orderDate }}</div>
              <small class="text-muted">Due: {{ o.dueDate || '—' }}</small>
            </td>
          </ng-container>

          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef>Total Value</th>
            <td mat-cell *matCellDef="let o">
              <strong>₹{{ o.totalAmount | number:'1.2-2' }}</strong>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">Manage</th>
            <td mat-cell *matCellDef="let o" class="text-right">
              <a mat-stroked-button color="primary" [routerLink]="['/orders', o.id]">
                View Flow
                <mat-icon iconPositionEnd>arrow_forward</mat-icon>
              </a>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>

        <div *ngIf="orders.length === 0" class="empty-state">
          No manufacturing orders match the filter criteria.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    .page-subtitle {
      font-size: 0.88rem;
      color: #64748b;
      margin-top: 4px;
    }
    .filter-bar {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .search-field {
      flex: 1;
      max-width: 360px;
    }
    .filter-select {
      width: 170px;
    }
    .table-container {
      padding: 0;
      overflow: hidden;
    }
    .w-full {
      width: 100%;
    }
    .order-link {
      color: #0284c7;
      text-decoration: none;
    }
    .order-link:hover {
      text-decoration: underline;
    }
    .font-semibold {
      font-weight: 600;
    }
    .text-muted {
      color: #64748b;
    }
    .text-right {
      text-align: right;
    }
    .priority-chip {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .priority-low { background: #f1f5f9; color: #475569; }
    .priority-medium { background: #e0f2fe; color: #0284c7; }
    .priority-high { background: #fef3c7; color: #d97706; }
    .priority-urgent { background: #fee2e2; color: #dc2626; }

    .loading-state {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
    .empty-state {
      padding: 36px;
      text-align: center;
      color: #64748b;
    }
  `]
})
export class OrderListComponent implements OnInit {
  private orderService = inject(OrderService);
  private snackBar = inject(MatSnackBar);

  orders: any[] = [];
  loading = true;
  searchQuery = '';
  selectedStatus = '';
  selectedPriority = '';
  statuses = ORDER_STATUSES;
  priorities = ORDER_PRIORITIES;
  displayedColumns = ['orderNumber', 'customer', 'status', 'priority', 'dates', 'total', 'actions'];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAll(
      this.selectedStatus || undefined,
      this.selectedPriority || undefined,
      this.searchQuery || undefined
    ).subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load manufacturing orders', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
