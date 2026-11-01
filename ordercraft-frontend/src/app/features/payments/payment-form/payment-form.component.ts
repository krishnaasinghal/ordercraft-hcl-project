import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PaymentService } from '../../../shared/services/payment.service';
import { InvoiceService } from '../../../shared/services/invoice.service';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>Record Customer Payment</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="payment-form">
        <div class="invoice-brief" *ngIf="data?.invoiceNumber">
          <span>Settling Invoice: <strong>{{ data.invoiceNumber }}</strong></span>
          <span>Buyer: <strong>{{ data.customerName }}</strong></span>
          <span *ngIf="data.balance">Balance Due: <strong>₹{{ data.balance | number:'1.2-2' }}</strong></span>
        </div>

        <mat-form-field appearance="outline" *ngIf="!data?.invoiceId" class="w-full">
          <mat-label>Select Invoice *</mat-label>
          <mat-select formControlName="invoiceId">
            <mat-option *ngFor="let inv of unpaidInvoices" [value]="inv.id">
              {{ inv.invoiceNumber }} — {{ inv.customerName }} (₹{{ inv.totalAmount }})
            </mat-option>
          </mat-select>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Payment Amount (₹) *</mat-label>
            <input matInput type="number" formControlName="amount" placeholder="0.00" min="1">
            <mat-error *ngIf="form.get('amount')?.hasError('required')">Amount is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Payment Method *</mat-label>
            <mat-select formControlName="paymentMethod">
              <mat-option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</mat-option>
              <mat-option value="UPI">UPI</mat-option>
              <mat-option value="CHECK">Cheque</mat-option>
              <mat-option value="CREDIT_CARD">Credit Card</mat-option>
              <mat-option value="CASH">Cash</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Payment Date *</mat-label>
            <input matInput type="date" formControlName="paymentDate">
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Bank Ref / UTR / Cheque #</mat-label>
            <input matInput formControlName="referenceNumber" placeholder="UTR-HDFC-99182">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Remarks / Notes</mat-label>
          <textarea matInput formControlName="notes" rows="2" placeholder="e.g. Cleared via corporate netbanking..."></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">
        Record Settlement
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .payment-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding-top: 10px;
      min-width: 480px;
    }
    .invoice-brief {
      background: #f1f5f9;
      padding: 12px 16px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      font-size: 0.82rem;
      color: #334155;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .w-full { width: 100%; }
    .flex-1 { flex: 1; }
  `]
})
export class PaymentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private paymentService = inject(PaymentService);
  private invoiceService = inject(InvoiceService);
  private dialogRef = inject(MatDialogRef<PaymentFormComponent>);
  private snackBar = inject(MatSnackBar);

  @Inject(MAT_DIALOG_DATA) public data: any = inject(MAT_DIALOG_DATA);

  form!: FormGroup;
  unpaidInvoices: any[] = [];

  ngOnInit(): void {
    const today = new Date().toISOString().substring(0, 10);
    this.form = this.fb.group({
      invoiceId: [this.data?.invoiceId || null, [Validators.required]],
      amount: [this.data?.balance || null, [Validators.required, Validators.min(1)]],
      paymentMethod: ['BANK_TRANSFER', [Validators.required]],
      paymentDate: [today, [Validators.required]],
      referenceNumber: [''],
      notes: ['']
    });

    if (!this.data?.invoiceId) {
      this.invoiceService.getAll().subscribe(invs => {
        this.unpaidInvoices = invs.filter((i: any) => i.status !== 'PAID' && i.status !== 'CANCELLED');
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;

    this.paymentService.create(this.form.value).subscribe({
      next: (res) => {
        this.snackBar.open('Payment successfully recorded against invoice', 'Close', { duration: 3000 });
        this.dialogRef.close(res);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to record payment', 'Close', { duration: 3000 });
      }
    });
  }
}
