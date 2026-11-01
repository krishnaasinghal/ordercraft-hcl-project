import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PurchaseOrderService } from '../../../shared/services/purchase-order.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-po-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    StatusBadgeComponent
  ],
  template: `
    <div class="page-container" *ngIf="po">
      <div class="top-nav-row">
        <a mat-button routerLink="/purchase-orders">
          <mat-icon>arrow_back</mat-icon>
          All Purchase Orders
        </a>

        <div class="action-buttons">
          <button *ngIf="po.status === 'DRAFT'" mat-raised-button color="primary" (click)="updateStatus('SENT')">
            <mat-icon>send</mat-icon>
            Send to Supplier
          </button>

          <button *ngIf="po.status === 'SENT'" mat-raised-button color="accent" (click)="updateStatus('ACKNOWLEDGED')">
            <mat-icon>thumb_up</mat-icon>
            Mark Acknowledged by Vendor
          </button>

          <button *ngIf="po.status === 'ACKNOWLEDGED' || po.status === 'SENT'" mat-raised-button class="btn-receive" (click)="receiveInventory()">
            <mat-icon>inventory</mat-icon>
            Receive Goods into Warehouse Stock
          </button>
        </div>
      </div>

      <!-- PO Overview Banner -->
      <div class="overview-banner app-card">
        <div class="banner-main">
          <div class="id-group">
            <span class="po-code">{{ po.poNumber }}</span>
            <app-status-badge [status]="po.status" type="po"></app-status-badge>
          </div>
          <h2 class="supplier-heading">{{ po.supplierName || po.supplier?.name }}</h2>
          <p class="po-meta">
            Ordered on: <strong>{{ po.orderDate }}</strong> &nbsp;|&nbsp;
            Expected delivery: <strong>{{ po.expectedDeliveryDate || 'Immediate' }}</strong>
            <span *ngIf="po.manufacturingOrderNumber || po.manufacturingOrder?.orderNumber">
              &nbsp;|&nbsp; Originating Order:
              <a [routerLink]="['/orders', po.manufacturingOrderId || po.manufacturingOrder?.id]" class="color-blue font-semibold ml-4">
                {{ po.manufacturingOrderNumber || po.manufacturingOrder?.orderNumber }}
              </a>
            </span>
          </p>
        </div>

        <div class="banner-stats">
          <div class="stat-box">
            <span class="stat-label">Total Procurement Value</span>
            <span class="stat-val">₹{{ po.totalAmount | number:'1.2-2' }}</span>
          </div>
        </div>
      </div>

      <!-- Items Section -->
      <div class="section-card app-card">
        <div class="card-header">
          <h3>Raw Material Line Items</h3>
          <span class="sub-label">{{ po.items?.length || 0 }} Items</span>
        </div>

        <table mat-table [dataSource]="po.items || []" class="w-full">
          <ng-container matColumnDef="material">
            <th mat-header-cell *matHeaderCellDef>Raw Material</th>
            <td mat-cell *matCellDef="let item">
              <strong class="color-navy">{{ item.rawMaterialName || item.rawMaterial?.name }}</strong>
              <div class="text-muted">{{ item.rawMaterialSku || item.rawMaterial?.sku }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="quantity">
            <th mat-header-cell *matHeaderCellDef>Ordered Quantity</th>
            <td mat-cell *matCellDef="let item">
              {{ item.quantity }} {{ item.rawMaterial?.unitOfMeasure || 'Units' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="unitCost">
            <th mat-header-cell *matHeaderCellDef>Unit Cost</th>
            <td mat-cell *matCellDef="let item">₹{{ item.unitCost | number:'1.2-2' }}</td>
          </ng-container>

          <ng-container matColumnDef="lineTotal">
            <th mat-header-cell *matHeaderCellDef class="text-right">Line Total</th>
            <td mat-cell *matCellDef="let item" class="text-right">
              <strong>₹{{ item.lineTotal | number:'1.2-2' }}</strong>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="['material', 'quantity', 'unitCost', 'lineTotal']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['material', 'quantity', 'unitCost', 'lineTotal']"></tr>
        </table>
      </div>

      <!-- Warehouse Receipt Notification when RECEIVED -->
      <div *ngIf="po.status === 'RECEIVED'" class="receipt-success-banner app-card">
        <mat-icon class="success-icon">check_circle</mat-icon>
        <div>
          <h4>Goods Received & Inventory Updated</h4>
          <p>All items on this purchase order have been credited to the raw materials inventory warehouse.</p>
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
    .top-nav-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .action-buttons {
      display: flex;
      gap: 12px;
    }
    .overview-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      border-radius: 10px;
      padding: 24px;
    }
    .id-group {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .po-code {
      font-size: 1.45rem;
      font-weight: 700;
      color: #0f172a;
    }
    .supplier-heading {
      font-size: 1.15rem;
      font-weight: 600;
      color: #334155;
      margin: 0 0 6px 0;
    }
    .po-meta {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0;
    }
    .stat-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 24px;
      display: flex;
      flex-direction: column;
      text-align: right;
    }
    .stat-label {
      font-size: 0.78rem;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
    }
    .stat-val {
      font-size: 1.45rem;
      font-weight: 700;
      color: #0f172a;
    }
    .section-card {
      background: white;
      border-radius: 10px;
      padding: 24px;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .card-header h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    .sub-label {
      font-size: 0.82rem;
      background: #f1f5f9;
      padding: 3px 8px;
      border-radius: 12px;
      color: #475569;
      font-weight: 600;
    }
    .w-full {
      width: 100%;
    }
    .color-navy {
      color: #0f172a;
    }
    .color-blue {
      color: #0284c7;
      text-decoration: none;
    }
    .text-muted {
      color: #64748b;
      font-size: 0.82rem;
    }
    .text-right {
      text-align: right;
    }
    .ml-4 {
      margin-left: 4px;
    }
    .font-semibold {
      font-weight: 600;
    }
    .btn-receive {
      background: #10b981 !important;
      color: white !important;
    }
    .receipt-success-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      padding: 18px 24px;
    }
    .success-icon {
      color: #10b981;
      font-size: 36px;
      width: 36px;
      height: 36px;
    }
    .receipt-success-banner h4 {
      margin: 0 0 4px 0;
      color: #065f46;
      font-size: 1rem;
    }
    .receipt-success-banner p {
      margin: 0;
      color: #047857;
      font-size: 0.85rem;
    }
  `]
})
export class PoDetailComponent implements OnInit {
  private poService = inject(PurchaseOrderService);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  po: any = null;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadPo(+params['id']);
      }
    });
  }

  loadPo(id: number): void {
    this.poService.getById(id).subscribe({
      next: (data) => this.po = data,
      error: () => this.snackBar.open('Failed to load purchase order', 'Close', { duration: 3000 })
    });
  }

  updateStatus(newStatus: string): void {
    if (!this.po) return;
    this.poService.updateStatus(this.po.id, newStatus).subscribe({
      next: (updated) => {
        this.po = updated;
        this.snackBar.open(`PO status updated to ${newStatus}`, 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Status update failed', 'Close', { duration: 3000 });
      }
    });
  }

  receiveInventory(): void {
    if (!this.po) return;
    this.poService.receive(this.po.id).subscribe({
      next: (updated) => {
        this.po = updated;
        this.snackBar.open('Goods received! Raw material inventory updated.', 'Close', { duration: 4000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Receipt processing failed', 'Close', { duration: 3000 });
      }
    });
  }
}
