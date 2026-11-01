import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { PaymentService } from '../../../shared/services/payment.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PaymentFormComponent } from '../../payments/payment-form/payment-form.component';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    StatusBadgeComponent
  ],
  template: `
    <div class="page-container" *ngIf="invoice">
      <!-- Action Toolbar (hidden during print) -->
      <div class="top-nav-row no-print">
        <a mat-button routerLink="/invoices">
          <mat-icon>arrow_back</mat-icon>
          All Invoices
        </a>

        <div class="action-buttons">
          <button *ngIf="invoice.status === 'DRAFT'" mat-raised-button color="primary" (click)="updateStatus('SENT')">
            <mat-icon>send</mat-icon>
            Mark as Sent to Customer
          </button>

          <button *ngIf="invoice.status !== 'PAID' && invoice.status !== 'CANCELLED'"
                  mat-raised-button color="accent" (click)="openPaymentDialog()">
            <mat-icon>payment</mat-icon>
            Record Customer Payment
          </button>

          <button mat-stroked-button (click)="printInvoice()">
            <mat-icon>print</mat-icon>
            Print Tax Invoice
          </button>
        </div>
      </div>

      <!-- Printable Commercial Tax Invoice Document -->
      <div class="invoice-document app-card">
        <!-- Document Header -->
        <div class="invoice-header">
          <div class="seller-details">
            <div class="brand-title">
              <mat-icon class="brand-icon">factory</mat-icon>
              <span>OrderCraft Manufacturing Ltd</span>
            </div>
            <p class="company-address">
              Industrial Corridor Phase 2, Hosur Road<br>
              Bengaluru, Karnataka - 560100, India<br>
              <strong>GSTIN:</strong> 29AAHCO9921M1Z4 | <strong>PAN:</strong> AAHCO9921M
            </p>
          </div>

          <div class="invoice-meta text-right">
            <h1 class="invoice-title">TAX INVOICE</h1>
            <div class="meta-row">
              <span class="meta-label">Invoice Number:</span>
              <strong class="meta-val">{{ invoice.invoiceNumber }}</strong>
            </div>
            <div class="meta-row">
              <span class="meta-label">Issue Date:</span>
              <span class="meta-val">{{ invoice.issueDate }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Payment Due:</span>
              <span class="meta-val">{{ invoice.dueDate }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Status:</span>
              <app-status-badge [status]="invoice.status" type="invoice"></app-status-badge>
            </div>
          </div>
        </div>

        <mat-divider class="my-20"></mat-divider>

        <!-- Bill To / Ship To -->
        <div class="billing-grid">
          <div class="billing-col">
            <div class="col-title">BILLED TO (BUYER):</div>
            <h3 class="buyer-name">{{ invoice.customerName || invoice.customer?.name }}</h3>
            <p class="buyer-address">
              {{ invoice.customer?.address || 'Industrial Premises' }}<br>
              {{ invoice.customer?.city }}, {{ invoice.customer?.state }} - {{ invoice.customer?.zipCode }}<br>
              <strong>GSTIN:</strong> {{ invoice.customer?.gstNumber || 'Unregistered' }}<br>
              <strong>Contact:</strong> {{ invoice.customer?.email }} | {{ invoice.customer?.phone }}
            </p>
          </div>

          <div class="billing-col text-right">
            <div class="col-title">DISPATCH & ORDER REFERENCE:</div>
            <p class="buyer-address">
              <strong>Manufacturing Order Ref:</strong>
              <a [routerLink]="['/orders', invoice.manufacturingOrderId || invoice.manufacturingOrder?.id]" class="color-blue font-semibold">
                {{ invoice.manufacturingOrderNumber || invoice.manufacturingOrder?.orderNumber }}
              </a><br>
              <strong>Payment Terms:</strong> Net 30 Days<br>
              <strong>Place of Supply:</strong> {{ invoice.customer?.state || 'Karnataka' }} (Code: 29)<br>
              <strong>Reverse Charge Applicable:</strong> No
            </p>
          </div>
        </div>

        <!-- Line Items Table -->
        <table class="doc-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Description of Goods / Services</th>
              <th>HSN/SAC</th>
              <th>Qty</th>
              <th>Rate (₹)</th>
              <th class="text-right">Taxable Value (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of invoiceItems; let i = index">
              <td>{{ i + 1 }}</td>
              <td>
                <strong>{{ item.name }}</strong>
                <div class="text-muted">{{ item.sku }}</div>
              </td>
              <td>8471</td>
              <td>{{ item.quantity }} Units</td>
              <td>{{ item.unitPrice | number:'1.2-2' }}</td>
              <td class="text-right"><strong>{{ item.lineTotal | number:'1.2-2' }}</strong></td>
            </tr>
          </tbody>
        </table>

        <!-- Tax & Summary Totals -->
        <div class="calculation-summary-row">
          <div class="bank-details-box">
            <div class="box-title">Remittance Bank Coordinates:</div>
            <p>
              <strong>Bank:</strong> HDFC Bank Ltd (Industrial Branch)<br>
              <strong>Account Name:</strong> OrderCraft Manufacturing Systems<br>
              <strong>A/C Number:</strong> 50200088991122<br>
              <strong>IFSC Code:</strong> HDFC0001234
            </p>
          </div>

          <div class="tax-breakdown-box">
            <div class="calc-line">
              <span>Subtotal (Taxable Amount):</span>
              <strong>₹{{ invoice.subtotal | number:'1.2-2' }}</strong>
            </div>
            <div class="calc-line">
              <span>CGST (9.00%):</span>
              <span>₹{{ (invoice.taxAmount / 2) | number:'1.2-2' }}</span>
            </div>
            <div class="calc-line">
              <span>SGST (9.00%):</span>
              <span>₹{{ (invoice.taxAmount / 2) | number:'1.2-2' }}</span>
            </div>
            <div class="calc-line total-grand">
              <span>Total Invoice Value:</span>
              <span>₹{{ invoice.totalAmount | number:'1.2-2' }}</span>
            </div>
            <div class="calc-line text-green" *ngIf="totalPaid > 0">
              <span>Payments Received:</span>
              <span>-₹{{ totalPaid | number:'1.2-2' }}</span>
            </div>
            <div class="calc-line balance-highlight">
              <span>Balance Amount Due:</span>
              <span>₹{{ (invoice.totalAmount - totalPaid) | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>

        <!-- Payments Log -->
        <div *ngIf="payments.length > 0" class="payments-history-section">
          <h4>Payment Settlement Receipts</h4>
          <table class="receipt-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Method</th>
                <th>Reference #</th>
                <th>Amount Paid</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of payments">
                <td>{{ p.paymentDate }}</td>
                <td>{{ p.paymentMethod }}</td>
                <td><code>{{ p.referenceNumber || '—' }}</code></td>
                <td><strong>₹{{ p.amount | number:'1.2-2' }}</strong></td>
                <td><span class="paid-tag">{{ p.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="doc-footer">
          <p>This is a computer-generated commercial tax invoice authorized under GST Rules.</p>
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
    .invoice-document {
      background: white;
      border-radius: 10px;
      padding: 40px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      max-width: 900px;
      margin: 0 auto;
      width: 100%;
    }
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .brand-icon {
      color: #0284c7;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .company-address {
      font-size: 0.82rem;
      color: #64748b;
      line-height: 1.5;
      margin: 0;
    }
    .invoice-title {
      font-size: 1.8rem;
      font-weight: 800;
      color: #0284c7;
      letter-spacing: 1px;
      margin: 0 0 12px 0;
    }
    .meta-row {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      font-size: 0.85rem;
      margin-bottom: 4px;
    }
    .meta-label {
      color: #64748b;
    }
    .meta-val {
      color: #0f172a;
      font-weight: 600;
    }
    .my-20 {
      margin: 20px 0 !important;
    }
    .billing-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 24px;
    }
    .col-title {
      font-size: 0.72rem;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .buyer-name {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 6px 0;
    }
    .buyer-address {
      font-size: 0.82rem;
      color: #475569;
      line-height: 1.6;
      margin: 0;
    }
    .doc-table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
    }
    .doc-table th {
      background: #f8fafc;
      border-bottom: 2px solid #cbd5e1;
      padding: 10px 12px;
      text-align: left;
      font-size: 0.8rem;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
    }
    .doc-table td {
      border-bottom: 1px solid #e2e8f0;
      padding: 12px;
      font-size: 0.88rem;
    }
    .calculation-summary-row {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      margin-top: 20px;
    }
    .bank-details-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      font-size: 0.82rem;
      flex: 1;
    }
    .box-title {
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .tax-breakdown-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px;
    }
    .calc-line {
      display: flex;
      justify-content: space-between;
      font-size: 0.88rem;
      padding: 4px 0;
    }
    .total-grand {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
      border-top: 1px solid #cbd5e1;
      border-bottom: 1px solid #cbd5e1;
      padding: 8px 0;
    }
    .balance-highlight {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0284c7;
      padding-top: 4px;
    }
    .payments-history-section {
      margin-top: 24px;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
    }
    .payments-history-section h4 {
      margin: 0 0 12px 0;
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
    }
    .receipt-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.82rem;
    }
    .receipt-table th {
      text-align: left;
      padding: 6px 8px;
      background: #f8fafc;
    }
    .receipt-table td {
      padding: 8px;
      border-bottom: 1px solid #f1f5f9;
    }
    .paid-tag {
      background: #d1fae5;
      color: #065f46;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.72rem;
    }
    .doc-footer {
      text-align: center;
      margin-top: 36px;
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .color-blue {
      color: #0284c7;
      text-decoration: none;
    }
    .text-green {
      color: #10b981;
    }
    .text-muted {
      color: #64748b;
      font-size: 0.78rem;
    }
    .text-right {
      text-align: right;
    }
    .font-semibold {
      font-weight: 600;
    }

    @media print {
      .no-print {
        display: none !important;
      }
      .invoice-document {
        box-shadow: none !important;
        padding: 0 !important;
      }
    }
  `]
})
export class InvoiceDetailComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  private paymentService = inject(PaymentService);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  invoice: any = null;
  invoiceItems: any[] = [];
  payments: any[] = [];
  totalPaid = 0;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadInvoice(+params['id']);
      }
    });
  }

  loadInvoice(id: number): void {
    this.invoiceService.getById(id).subscribe({
      next: (data: any) => {
        this.invoice = data;
        // Build items list from manufacturing order if needed
        if (data.manufacturingOrder?.items) {
          this.invoiceItems = data.manufacturingOrder.items.map((it: any) => ({
            name: it.productName || it.product?.name,
            sku: it.productSku || it.product?.sku,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            lineTotal: it.lineTotal
          }));
        } else {
          this.invoiceItems = [{
            name: 'Manufactured Assemblies',
            sku: 'MO-' + (data.manufacturingOrderNumber || 'BATCH'),
            quantity: 1,
            unitPrice: data.subtotal,
            lineTotal: data.subtotal
          }];
        }

        this.loadPayments(id);
      },
      error: () => this.snackBar.open('Failed to load invoice', 'Close', { duration: 3000 })
    });
  }

  loadPayments(invoiceId: number): void {
    this.paymentService.getByInvoice(invoiceId).subscribe({
      next: (pays) => {
        this.payments = pays;
        this.totalPaid = pays.reduce((sum: number, p: any) => sum + (+p.amount || 0), 0);
      }
    });
  }

  updateStatus(status: string): void {
    if (!this.invoice) return;
    this.invoiceService.updateStatus(this.invoice.id, status).subscribe({
      next: (updated) => {
        this.invoice = updated;
        this.snackBar.open(`Invoice marked as ${status}`, 'Close', { duration: 3000 });
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Status update failed', 'Close', { duration: 3000 })
    });
  }

  openPaymentDialog(): void {
    const dialogRef = this.dialog.open(PaymentFormComponent, {
      data: {
        invoiceId: this.invoice.id,
        invoiceNumber: this.invoice.invoiceNumber,
        customerName: this.invoice.customerName || this.invoice.customer?.name,
        balance: this.invoice.totalAmount - this.totalPaid
      },
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadInvoice(this.invoice.id);
      }
    });
  }

  printInvoice(): void {
    window.print();
  }
}
