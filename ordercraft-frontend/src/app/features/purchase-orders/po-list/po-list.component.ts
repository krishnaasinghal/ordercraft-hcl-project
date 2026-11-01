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
import { PurchaseOrderService } from '../../../shared/services/purchase-order.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-po-list',
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
          <h1 class="page-title">Supplier Purchase Orders (PO)</h1>
          <p class="page-subtitle">Manage raw material procurement, supplier orders, and incoming warehouse goods receipts</p>
        </div>
      </div>

      <div class="filter-bar">
        <mat-form-field appearance="outline" class="filter-select">
          <mat-label>PO Status</mat-label>
          <mat-select [(ngModel)]="selectedStatus" (selectionChange)="loadPurchaseOrders()">
            <mat-option value="">All Statuses</mat-option>
            <mat-option value="DRAFT">DRAFT</mat-option>
            <mat-option value="SENT">SENT</mat-option>
            <mat-option value="ACKNOWLEDGED">ACKNOWLEDGED</mat-option>
            <mat-option value="RECEIVED">RECEIVED</mat-option>
            <mat-option value="CANCELLED">CANCELLED</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!loading" class="table-container app-card">
        <table mat-table [dataSource]="purchaseOrders" class="w-full">
          <ng-container matColumnDef="poNumber">
            <th mat-header-cell *matHeaderCellDef>PO Number</th>
            <td mat-cell *matCellDef="let po">
              <a [routerLink]="['/purchase-orders', po.id]" class="po-link font-semibold">
                {{ po.poNumber }}
              </a>
            </td>
          </ng-container>

          <ng-container matColumnDef="supplier">
            <th mat-header-cell *matHeaderCellDef>Supplier / Vendor</th>
            <td mat-cell *matCellDef="let po">
              {{ po.supplierName || po.supplier?.name }}
            </td>
          </ng-container>

          <ng-container matColumnDef="mo">
            <th mat-header-cell *matHeaderCellDef>Source Order</th>
            <td mat-cell *matCellDef="let po">
              <span *ngIf="po.manufacturingOrderNumber || po.manufacturingOrder?.orderNumber" class="source-mo-badge">
                {{ po.manufacturingOrderNumber || po.manufacturingOrder?.orderNumber }}
              </span>
              <span *ngIf="!po.manufacturingOrderNumber && !po.manufacturingOrder?.orderNumber" class="text-muted">Direct</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>PO Status</th>
            <td mat-cell *matCellDef="let po">
              <app-status-badge [status]="po.status" type="po"></app-status-badge>
            </td>
          </ng-container>

          <ng-container matColumnDef="expectedDelivery">
            <th mat-header-cell *matHeaderCellDef>Expected Delivery</th>
            <td mat-cell *matCellDef="let po">
              {{ po.expectedDeliveryDate || '—' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef>Total Cost</th>
            <td mat-cell *matCellDef="let po">
              <strong>₹{{ po.totalAmount | number:'1.2-2' }}</strong>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">Action</th>
            <td mat-cell *matCellDef="let po" class="text-right">
              <a mat-stroked-button color="primary" [routerLink]="['/purchase-orders', po.id]">
                Inspect & Receive
              </a>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>

        <div *ngIf="purchaseOrders.length === 0" class="empty-state">
          No purchase orders found.
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
    .po-link {
      color: #0284c7;
      text-decoration: none;
    }
    .po-link:hover {
      text-decoration: underline;
    }
    .source-mo-badge {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.78rem;
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
export class PoListComponent implements OnInit {
  private poService = inject(PurchaseOrderService);
  private snackBar = inject(MatSnackBar);

  purchaseOrders: any[] = [];
  loading = true;
  selectedStatus = '';
  displayedColumns = ['poNumber', 'supplier', 'mo', 'status', 'expectedDelivery', 'total', 'actions'];

  ngOnInit(): void {
    this.loadPurchaseOrders();
  }

  loadPurchaseOrders(): void {
    this.loading = true;
    this.poService.getAll(this.selectedStatus || undefined).subscribe({
      next: (data) => {
        this.purchaseOrders = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load purchase orders', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
