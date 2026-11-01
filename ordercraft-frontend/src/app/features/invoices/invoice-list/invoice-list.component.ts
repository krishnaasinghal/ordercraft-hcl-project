import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { INVOICE_STATUSES } from '../../../shared/models/invoice.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    StatusBadgeComponent
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Commercial Tax Invoices</h1>
          <p class="page-subtitle">Track billing, GST tax line items, payment terms, and outstanding receivable aging</p>
        </div>
      </div>

      <div class="filter-bar">
        <mat-form-field appearance="outline" class="filter-select">
          <mat-label>Invoice Status</mat-label>
          <mat-select [(ngModel)]="selectedStatus" (selectionChange)="loadInvoices()">
            <mat-option value="">All Invoices</mat-option>
            <mat-option *ngFor="let s of statuses" [value]="s">{{ s }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!loading" class="table-container app-card">
        <table mat-table [dataSource]="invoices" class="w-full">
          <ng-container matColumnDef="invoiceNumber">
            <th mat-header-cell *matHeaderCellDef>Invoice #</th>
            <td mat-cell *matCellDef="let inv">
              <a [routerLink]="['/invoices', inv.id]" class="inv-link font-semibold">
                {{ inv.invoiceNumber }}
              </a>
            </td>
          </ng-container>

          <ng-container matColumnDef="customer">
            <th mat-header-cell *matHeaderCellDef>Customer</th>
            <td mat-cell *matCellDef="let inv">
              {{ inv.customerName || inv.customer?.name }}
            </td>
          </ng-container>

          <ng-container matColumnDef="order">
            <th mat-header-cell *matHeaderCellDef>Order Ref</th>
            <td mat-cell *matCellDef="let inv">
              <span class="order-ref">{{ inv.manufacturingOrderNumber || inv.manufacturingOrder?.orderNumber }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="dates">
            <th mat-header-cell *matHeaderCellDef>Issue / Due Date</th>
            <td mat-cell *matCellDef="let inv">
              <div>{{ inv.issueDate }}</div>
              <small class="text-muted">Due: {{ inv.dueDate }}</small>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Payment Status</th>
            <td mat-cell *matCellDef="let inv">
              <app-status-badge [status]="inv.status" type="invoice"></app-status-badge>
            </td>
          </ng-container>

          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef class="text-right">Total (incl. GST)</th>
            <td mat-cell *matCellDef="let inv" class="text-right">
              <strong>₹{{ inv.totalAmount | number:'1.2-2' }}</strong>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
            <td mat-cell *matCellDef="let inv" class="text-right">
              <a mat-stroked-button color="primary" [routerLink]="['/invoices', inv.id]">
                View & Print
              </a>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>

        <div *ngIf="invoices.length === 0" class="empty-state">
          No invoices found. Generate an invoice from any completed Manufacturing Order.
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
    }
    .filter-select {
      width: 180px;
    }
    .table-container {
      padding: 0;
      overflow: hidden;
    }
    .w-full {
      width: 100%;
    }
    .inv-link {
      color: #0284c7;
      text-decoration: none;
    }
    .inv-link:hover {
      text-decoration: underline;
    }
    .order-ref {
      background: #f1f5f9;
      color: #334155;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
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
export class InvoiceListComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  private snackBar = inject(MatSnackBar);

  invoices: any[] = [];
  loading = true;
  selectedStatus = '';
  statuses = INVOICE_STATUSES;
  displayedColumns = ['invoiceNumber', 'customer', 'order', 'dates', 'status', 'total', 'actions'];

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading = true;
    this.invoiceService.getAll(this.selectedStatus || undefined).subscribe({
      next: (data) => {
        this.invoices = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load invoices', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
