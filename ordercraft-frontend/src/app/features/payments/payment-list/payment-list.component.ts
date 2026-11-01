import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PaymentService } from '../../../shared/services/payment.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PaymentFormComponent } from '../payment-form/payment-form.component';

@Component({
  selector: 'app-payment-list',
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
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    StatusBadgeComponent
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Accounts Receivable & Payment Receipts</h1>
          <p class="page-subtitle">Complete ledger of customer remittances, banking references, and invoice reconciliations</p>
        </div>
        <button mat-raised-button color="primary" (click)="openPaymentDialog()">
          <mat-icon>add</mat-icon>
          Record Payment
        </button>
      </div>

      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!loading" class="table-container app-card">
        <table mat-table [dataSource]="payments" class="w-full">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Payment Date</th>
            <td mat-cell *matCellDef="let p">
              <strong>{{ p.paymentDate }}</strong>
            </td>
          </ng-container>

          <ng-container matColumnDef="invoice">
            <th mat-header-cell *matHeaderCellDef>Settled Invoice</th>
            <td mat-cell *matCellDef="let p">
              <a [routerLink]="['/invoices', p.invoiceId || p.invoice?.id]" class="color-blue font-semibold">
                {{ p.invoiceNumber || p.invoice?.invoiceNumber }}
              </a>
            </td>
          </ng-container>

          <ng-container matColumnDef="method">
            <th mat-header-cell *matHeaderCellDef>Payment Method</th>
            <td mat-cell *matCellDef="let p">
              <span class="method-tag">{{ p.paymentMethod }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="reference">
            <th mat-header-cell *matHeaderCellDef>Bank Reference / UTR #</th>
            <td mat-cell *matCellDef="let p">
              <code>{{ p.referenceNumber || '—' }}</code>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let p">
              <app-status-badge [status]="p.status" type="payment"></app-status-badge>
            </td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef class="text-right">Remittance Amount</th>
            <td mat-cell *matCellDef="let p" class="text-right">
              <strong class="text-green font-semibold">₹{{ p.amount | number:'1.2-2' }}</strong>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>

        <div *ngIf="payments.length === 0" class="empty-state">
          No payment receipts logged yet. Click "Record Payment" to reconcile customer remittances.
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
    .table-container {
      padding: 0;
      overflow: hidden;
    }
    .w-full {
      width: 100%;
    }
    .color-blue {
      color: #0284c7;
      text-decoration: none;
    }
    .text-green {
      color: #10b981;
    }
    .text-right {
      text-align: right;
    }
    .font-semibold {
      font-weight: 600;
    }
    .method-tag {
      background: #f1f5f9;
      color: #334155;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.78rem;
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
export class PaymentListComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  payments: any[] = [];
  loading = true;
  displayedColumns = ['date', 'invoice', 'method', 'reference', 'status', 'amount'];

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading = true;
    this.paymentService.getAll().subscribe({
      next: (data) => {
        this.payments = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load payments', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  openPaymentDialog(): void {
    const dialogRef = this.dialog.open(PaymentFormComponent, {
      data: null,
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPayments();
      }
    });
  }
}
