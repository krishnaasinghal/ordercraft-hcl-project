import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Supplier } from '../../../shared/models/supplier.model';

@Component({
  selector: 'app-supplier-form',
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
    <h2 mat-dialog-title>{{ isEdit ? 'Edit Supplier' : 'Add New Supplier' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="supplier-form">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Supplier / Vendor Name *</mat-label>
          <input matInput formControlName="name" placeholder="e.g. Tata Steel Tubes & Sheets">
          <mat-error *ngIf="form.get('name')?.hasError('required')">Supplier name is required</mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Contact Person</mat-label>
            <input matInput formControlName="contactPerson" placeholder="Sunil Sharma">
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Email Address</mat-label>
            <input matInput formControlName="email" type="email" placeholder="sales@supplier.com">
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Phone Number</mat-label>
            <input matInput formControlName="phone" placeholder="+91 98300 12345">
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>GST Number</mat-label>
            <input matInput formControlName="gstNumber" placeholder="20AAACT2727Q1ZW">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Address</mat-label>
          <textarea matInput formControlName="address" rows="2" placeholder="Factory works, industrial complex..."></textarea>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>City</mat-label>
            <input matInput formControlName="city" placeholder="Jamshedpur">
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>State</mat-label>
            <input matInput formControlName="state" placeholder="Jharkhand">
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
        {{ isEdit ? 'Update Supplier' : 'Create Supplier' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .supplier-form {
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
export class SupplierFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SupplierFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Supplier | null
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data?.id;
    this.form = this.fb.group({
      name: [this.data?.name || '', [Validators.required]],
      contactPerson: [this.data?.contactPerson || ''],
      email: [this.data?.email || '', [Validators.email]],
      phone: [this.data?.phone || ''],
      gstNumber: [this.data?.gstNumber || ''],
      address: [this.data?.address || ''],
      city: [this.data?.city || ''],
      state: [this.data?.state || ''],
      country: [this.data?.country || 'India']
    });
  }

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
