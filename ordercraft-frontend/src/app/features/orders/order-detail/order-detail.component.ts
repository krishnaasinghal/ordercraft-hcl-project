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
import { OrderService } from '../../../shared/services/order.service';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { PurchaseOrderService } from '../../../shared/services/purchase-order.service';
import { PurchaseOrder } from '../../../shared/models/purchase-order.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-order-detail',
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
    <div class="page-container" *ngIf="order">
      <!-- Breadcrumb and Top Actions -->
      <div class="top-nav-row">
        <a mat-button routerLink="/orders">
          <mat-icon>arrow_back</mat-icon>
          All Orders
        </a>

        <div class="action-buttons">
          <!-- Lifecycle Action Buttons -->
          <button *ngIf="order.status === 'DRAFT'" mat-raised-button color="primary" (click)="updateStatus('CONFIRMED')">
            <mat-icon>check</mat-icon>
            Confirm Order
          </button>

          <button *ngIf="order.status === 'CONFIRMED'" mat-raised-button color="accent" (click)="updateStatus('IN_PRODUCTION')">
            <mat-icon>precision_manufacturing</mat-icon>
            Start Production Run
          </button>

          <button *ngIf="order.status === 'IN_PRODUCTION'" mat-raised-button class="btn-complete" (click)="updateStatus('COMPLETED')">
            <mat-icon>done_all</mat-icon>
            Mark Production Completed
          </button>

          <button *ngIf="order.status === 'COMPLETED'" mat-raised-button color="primary" (click)="generateInvoice()">
            <mat-icon>receipt_long</mat-icon>
            Generate Tax Invoice
          </button>

          <button *ngIf="order.status === 'COMPLETED'" mat-raised-button color="accent" (click)="updateStatus('DELIVERED')">
            <mat-icon>local_shipping</mat-icon>
            Mark Delivered
          </button>
        </div>
      </div>

      <!-- Order Overview Banner -->
      <div class="overview-banner app-card">
        <div class="banner-main">
          <div class="order-id-group">
            <span class="order-code">{{ order.orderNumber }}</span>
            <app-status-badge [status]="order.status" type="order"></app-status-badge>
            <span [class]="'priority-chip priority-' + order.priority?.toLowerCase()">
              {{ order.priority }} Priority
            </span>
          </div>
          <h2 class="customer-heading">{{ order.customerName || order.customer?.name }}</h2>
          <p class="order-meta">
            Ordered on: <strong>{{ order.orderDate }}</strong> &nbsp;|&nbsp;
            Due target: <strong>{{ order.dueDate || 'Unscheduled' }}</strong>
            <span *ngIf="order.completionDate"> &nbsp;|&nbsp; Completed on: <strong>{{ order.completionDate }}</strong></span>
          </p>
        </div>

        <div class="banner-stats">
          <div class="stat-box">
            <span class="stat-label">Total Value</span>
            <span class="stat-val">₹{{ order.totalAmount | number:'1.2-2' }}</span>
          </div>
        </div>
      </div>

      <!-- Line Items Section -->
      <div class="section-card app-card">
        <div class="card-header">
          <h3>Manufactured Finished Products</h3>
          <span class="sub-label">{{ order.items?.length || 0 }} Line Items</span>
        </div>

        <table mat-table [dataSource]="order.items || []" class="w-full">
          <ng-container matColumnDef="product">
            <th mat-header-cell *matHeaderCellDef>Product</th>
            <td mat-cell *matCellDef="let item">
              <strong class="color-navy">{{ item.productName || item.product?.name }}</strong>
              <div class="text-muted">{{ item.productSku || item.product?.sku }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="quantity">
            <th mat-header-cell *matHeaderCellDef>Quantity</th>
            <td mat-cell *matCellDef="let item">{{ item.quantity }} Units</td>
          </ng-container>

          <ng-container matColumnDef="unitPrice">
            <th mat-header-cell *matHeaderCellDef>Unit Price</th>
            <td mat-cell *matCellDef="let item">₹{{ item.unitPrice | number:'1.2-2' }}</td>
          </ng-container>

          <ng-container matColumnDef="lineTotal">
            <th mat-header-cell *matHeaderCellDef class="text-right">Line Total</th>
            <td mat-cell *matCellDef="let item" class="text-right">
              <strong>₹{{ item.lineTotal | number:'1.2-2' }}</strong>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="['product', 'quantity', 'unitPrice', 'lineTotal']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['product', 'quantity', 'unitPrice', 'lineTotal']"></tr>
        </table>
      </div>

      <!-- BOM Explosion & Material Requirements Planning (MRP) -->
      <div class="section-card app-card">
        <div class="card-header">
          <div>
            <h3>Bill of Materials Explosion & MRP Analysis</h3>
            <p class="section-sub">Explodes active BOMs to calculate gross materials, warehouse stock, and procurement shortages</p>
          </div>
          <div class="header-action-group">
            <button mat-stroked-button color="primary" (click)="explodeBom()" [disabled]="exploding">
              <mat-icon>account_tree</mat-icon>
              {{ explodedMaterials.length ? 'Re-Explode BOM' : 'Run BOM Explosion' }}
            </button>
            <button *ngIf="hasShortages" mat-raised-button color="accent" (click)="generatePurchaseOrders()" [disabled]="generatingPo">
              <mat-icon>shopping_cart_checkout</mat-icon>
              Auto-Generate POs for Shortage
            </button>
          </div>
        </div>

        <div *ngIf="exploding" class="spinner-center">
          <mat-spinner diameter="36"></mat-spinner>
          <span>Exploding Bill of Materials...</span>
        </div>

        <div *ngIf="!exploding && explodedMaterials.length > 0" class="explosion-table-wrap">
          <table mat-table [dataSource]="explodedMaterials" class="w-full">
            <ng-container matColumnDef="material">
              <th mat-header-cell *matHeaderCellDef>Raw Material Component</th>
              <td mat-cell *matCellDef="let m">
                <strong>{{ m.rawMaterialName }}</strong>
                <div class="text-muted">{{ m.sku }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="required">
              <th mat-header-cell *matHeaderCellDef>Gross Required</th>
              <td mat-cell *matCellDef="let m">
                {{ m.totalRequired }} {{ m.unitOfMeasure }}
              </td>
            </ng-container>

            <ng-container matColumnDef="stock">
              <th mat-header-cell *matHeaderCellDef>Warehouse Stock</th>
              <td mat-cell *matCellDef="let m">
                {{ m.currentStock }} {{ m.unitOfMeasure }}
              </td>
            </ng-container>

            <ng-container matColumnDef="shortage">
              <th mat-header-cell *matHeaderCellDef>Procurement Shortage</th>
              <td mat-cell *matCellDef="let m">
                <span *ngIf="m.shortage > 0" class="shortage-badge">
                  +{{ m.shortage }} {{ m.unitOfMeasure }} Short
                </span>
                <span *ngIf="m.shortage <= 0" class="text-green font-semibold">
                  Sufficient in Stock
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="supplier">
              <th mat-header-cell *matHeaderCellDef>Assigned Supplier</th>
              <td mat-cell *matCellDef="let m">
                {{ m.supplierName || 'No preferred vendor' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="cost">
              <th mat-header-cell *matHeaderCellDef class="text-right">Est. Procurement Cost</th>
              <td mat-cell *matCellDef="let m" class="text-right">
                ₹{{ m.procurementCost | number:'1.2-2' }}
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="['material', 'required', 'stock', 'shortage', 'supplier', 'cost']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['material', 'required', 'stock', 'shortage', 'supplier', 'cost']"></tr>
          </table>
        </div>

        <div *ngIf="!exploding && explodedMaterials.length === 0" class="empty-explosion-notice">
          Click <strong>"Run BOM Explosion"</strong> to compute material requirements across all ordered products.
        </div>
      </div>

      <!-- Associated Purchase Orders Section -->
      <div *ngIf="associatedPos.length > 0" class="section-card app-card">
        <div class="card-header">
          <h3>Generated Supplier Purchase Orders</h3>
          <span class="sub-label">{{ associatedPos.length }} Orders</span>
        </div>

        <table mat-table [dataSource]="associatedPos" class="w-full">
          <ng-container matColumnDef="poNumber">
            <th mat-header-cell *matHeaderCellDef>PO #</th>
            <td mat-cell *matCellDef="let po">
              <a [routerLink]="['/purchase-orders', po.id]" class="color-blue font-semibold">{{ po.poNumber }}</a>
            </td>
          </ng-container>

          <ng-container matColumnDef="supplier">
            <th mat-header-cell *matHeaderCellDef>Supplier</th>
            <td mat-cell *matCellDef="let po">{{ po.supplierName || po.supplier?.name }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let po">
              <app-status-badge [status]="po.status" type="po"></app-status-badge>
            </td>
          </ng-container>

          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef class="text-right">PO Total</th>
            <td mat-cell *matCellDef="let po" class="text-right">₹{{ po.totalAmount | number:'1.2-2' }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="['poNumber', 'supplier', 'status', 'total']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['poNumber', 'supplier', 'status', 'total']"></tr>
        </table>
      </div>

      <!-- Associated Tax Invoice Section -->
      <div *ngIf="associatedInvoice" class="section-card app-card">
        <div class="card-header">
          <h3>Tax Invoice Generated</h3>
          <app-status-badge [status]="associatedInvoice.status" type="invoice"></app-status-badge>
        </div>

        <div class="invoice-summary-grid">
          <div>
            <span class="text-muted">Invoice #:</span>
            <a [routerLink]="['/invoices', associatedInvoice.id]" class="color-blue font-semibold ml-8">
              {{ associatedInvoice.invoiceNumber }}
            </a>
          </div>
          <div>
            <span class="text-muted">Issue Date:</span>
            <strong class="ml-8">{{ associatedInvoice.issueDate }}</strong>
          </div>
          <div>
            <span class="text-muted">Due Date:</span>
            <strong class="ml-8">{{ associatedInvoice.dueDate }}</strong>
          </div>
          <div>
            <span class="text-muted">Final Amount:</span>
            <strong class="ml-8 text-green font-semibold">₹{{ associatedInvoice.totalAmount | number:'1.2-2' }}</strong>
          </div>
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
    .order-id-group {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .order-code {
      font-size: 1.45rem;
      font-weight: 700;
      color: #0f172a;
    }
    .customer-heading {
      font-size: 1.15rem;
      font-weight: 600;
      color: #334155;
      margin: 0 0 6px 0;
    }
    .order-meta {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0;
    }
    .priority-chip {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .priority-low { background: #f1f5f9; color: #475569; }
    .priority-medium { background: #e0f2fe; color: #0284c7; }
    .priority-high { background: #fef3c7; color: #d97706; }
    .priority-urgent { background: #fee2e2; color: #dc2626; }

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
    .section-sub {
      font-size: 0.82rem;
      color: #64748b;
      margin: 4px 0 0 0;
    }
    .header-action-group {
      display: flex;
      gap: 12px;
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
    .text-green {
      color: #10b981;
    }
    .text-right {
      text-align: right;
    }
    .shortage-badge {
      background: #fee2e2;
      color: #dc2626;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    .spinner-center {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px;
      justify-content: center;
      color: #64748b;
    }
    .empty-explosion-notice {
      padding: 32px;
      text-align: center;
      color: #64748b;
      background: #f8fafc;
      border-radius: 6px;
      border: 1px dashed #cbd5e1;
    }
    .invoice-summary-grid {
      display: flex;
      gap: 32px;
      padding: 16px 0;
    }
    .ml-8 {
      margin-left: 8px;
    }
    .btn-complete {
      background: #10b981 !important;
      color: white !important;
    }
  `]
})
export class OrderDetailComponent implements OnInit {
  private orderService = inject(OrderService);
  private invoiceService = inject(InvoiceService);
  private poService = inject(PurchaseOrderService);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  order: any = null;
  explodedMaterials: any[] = [];
  associatedPos: any[] = [];
  associatedInvoice: any = null;
  exploding = false;
  generatingPo = false;
  hasShortages = false;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadOrder(+params['id']);
      }
    });
  }

  loadOrder(id: number): void {
    this.orderService.getById(id).subscribe({
      next: (data) => {
        this.order = data;
        this.loadAssociatedData(id);
      },
      error: () => {
        this.snackBar.open('Failed to load manufacturing order', 'Close', { duration: 3000 });
      }
    });
  }

  loadAssociatedData(orderId: number): void {
    this.poService.getAll(undefined, undefined, orderId).subscribe(pos => {
      this.associatedPos = pos;
    });

    this.invoiceService.getAll().subscribe(invoices => {
      this.associatedInvoice = invoices.find((inv: any) =>
        inv.manufacturingOrderId === orderId || inv.manufacturingOrder?.id === orderId
      ) || null;
    });
  }

  updateStatus(newStatus: string): void {
    if (!this.order) return;
    this.orderService.updateStatus(this.order.id, newStatus).subscribe({
      next: (updated) => {
        this.order = updated;
        this.snackBar.open(`Order status updated to ${newStatus}`, 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Status transition failed', 'Close', { duration: 3000 });
      }
    });
  }

  explodeBom(): void {
    if (!this.order) return;
    this.exploding = true;
    this.orderService.explodeBom(this.order.id).subscribe({
      next: (materials) => {
        this.explodedMaterials = materials;
        this.hasShortages = materials.some((m: any) => m.shortage > 0);
        this.exploding = false;
        this.snackBar.open(`Exploded BOM successfully (${materials.length} components analyzed)`, 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.exploding = false;
        this.snackBar.open(err.error?.message || 'BOM explosion failed', 'Close', { duration: 3000 });
      }
    });
  }

  generatePurchaseOrders(): void {
    if (!this.order) return;
    this.generatingPo = true;
    this.orderService.generatePurchaseOrders(this.order.id).subscribe({
      next: (pos: PurchaseOrder[]) => {
        this.associatedPos = pos;
        this.generatingPo = false;
        this.hasShortages = false;
        this.snackBar.open(`Generated ${pos.length} supplier Purchase Order(s) for raw material shortage!`, 'Close', { duration: 4000 });
        this.explodeBom(); // Refresh stock analysis
      },
      error: (err: any) => {
        this.generatingPo = false;
        this.snackBar.open(err.error?.message || 'PO generation failed', 'Close', { duration: 3000 });
      }
    });
  }

  generateInvoice(): void {
    if (!this.order) return;
    this.orderService.generateInvoice(this.order.id).subscribe({
      next: (inv) => {
        this.associatedInvoice = inv;
        this.snackBar.open(`Invoice #${inv.invoiceNumber} generated!`, 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Invoice generation failed', 'Close', { duration: 3000 });
      }
    });
  }
}
