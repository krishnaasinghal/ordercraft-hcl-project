import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Customer } from '../../../shared/models/customer.model';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Edit Customer' : 'Add New Customer' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="customer-form">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Company / Customer Name *</mat-label>
          <input matInput formControlName="name" placeholder="e.g. Apex Robotics Ltd">
          <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Email Address</mat-label>
            <input matInput formControlName="email" type="email" placeholder="contact@company.com">
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Phone Number</mat-label>
            <input matInput formControlName="phone" placeholder="+91 98765 43210">
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>GST / Tax Identification</mat-label>
            <input matInput formControlName="gstNumber" placeholder="29AABCA1234F1Z5">
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>City</mat-label>
            <input matInput formControlName="city" placeholder="Bengaluru">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Address</mat-label>
          <textarea matInput formControlName="address" rows="2" placeholder="Industrial area, street, unit..."></textarea>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>State</mat-label>
            <input matInput formControlName="state" placeholder="Karnataka">
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Zip / Postal Code</mat-label>
            <input matInput formControlName="zipCode" placeholder="560100">
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Country</mat-label>
            <input matInput formControlName="country" placeholder="India">
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">
        {{ isEdit ? 'Update Customer' : 'Create Customer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .customer-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 10px;
      min-width: 520px;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .w-full { width: 100%; }
    .flex-1 { flex: 1; }
  `]
})
export class CustomerFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CustomerFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Customer | null
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data?.id;
    this.form = this.fb.group({
      name: [this.data?.name || '', [Validators.required]],
      email: [this.data?.email || '', [Validators.email]],
      phone: [this.data?.phone || ''],
      gstNumber: [this.data?.gstNumber || ''],
      address: [this.data?.address || ''],
      city: [this.data?.city || ''],
      state: [this.data?.state || ''],
      zipCode: [this.data?.zipCode || ''],
      country: [this.data?.country || 'India']
    });
  }

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
