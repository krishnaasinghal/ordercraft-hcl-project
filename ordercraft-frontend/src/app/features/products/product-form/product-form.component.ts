import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Product, PRODUCT_CATEGORIES, UNITS_OF_MEASURE } from '../../../shared/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Edit Product' : 'Add New Manufactured Product' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="product-form">
        <div class="form-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Product SKU *</mat-label>
            <input matInput formControlName="sku" placeholder="PRD-IOT-100">
            <mat-error *ngIf="form.get('sku')?.hasError('required')">SKU is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Product Category *</mat-label>
            <mat-select formControlName="category">
              <mat-option *ngFor="let cat of categories" [value]="cat">{{ cat }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Product Name *</mat-label>
          <input matInput formControlName="name" placeholder="Smart Industrial IoT Gateway Pro">
          <mat-error *ngIf="form.get('name')?.hasError('required')">Product name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Technical Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Specifications, electrical ratings, dimensions..."></textarea>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Selling Unit Price (₹) *</mat-label>
            <input matInput type="number" formControlName="unitPrice" placeholder="8500.00">
            <mat-error *ngIf="form.get('unitPrice')?.hasError('required')">Unit price is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Unit of Measure *</mat-label>
            <mat-select formControlName="unitOfMeasure">
              <mat-option *ngFor="let uom of uoms" [value]="uom">{{ uom }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">
        {{ isEdit ? 'Update Product' : 'Create Product' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .product-form {
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
export class ProductFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  categories = PRODUCT_CATEGORIES;
  uoms = UNITS_OF_MEASURE;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product | null
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data?.id;
    this.form = this.fb.group({
      sku: [this.data?.sku || '', [Validators.required]],
      name: [this.data?.name || '', [Validators.required]],
      description: [this.data?.description || ''],
      unitPrice: [this.data?.unitPrice || null, [Validators.required, Validators.min(0)]],
      category: [this.data?.category || 'Electronics', [Validators.required]],
      unitOfMeasure: [this.data?.unitOfMeasure || 'PCS', [Validators.required]]
    });
  }

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
