import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { BomService } from '../../../shared/services/bom.service';
import { ProductService } from '../../../shared/services/product.service';
import { RawMaterialService } from '../../../shared/services/raw-material.service';
import { Product } from '../../../shared/models/product.model';
import { RawMaterial } from '../../../shared/models/raw-material.model';

@Component({
  selector: 'app-bom-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTableModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ isEdit ? 'Edit Bill of Materials' : 'Create Bill of Materials (BOM)' }}</h1>
          <p class="page-subtitle">Configure engineering material breakdown, scrap allowances, and production ratios</p>
        </div>
        <button mat-button routerLink="/bom">
          <mat-icon>arrow_back</mat-icon>
          Back to BOMs
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="save()" class="bom-form-card app-card">
        <!-- Header Info -->
        <div class="section-title">Product & Header Information</div>
        <div class="form-grid-3">
          <mat-form-field appearance="outline">
            <mat-label>Select Manufactured Product *</mat-label>
            <mat-select formControlName="productId">
              <mat-option *ngFor="let p of products" [value]="p.id">
                {{ p.name }} ({{ p.sku }})
              </mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('productId')?.hasError('required')">Product selection is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>BOM Version *</mat-label>
            <input matInput formControlName="version" placeholder="e.g. V1.0 or V2.1">
            <mat-error *ngIf="form.get('version')?.hasError('required')">Version is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Effective Date</mat-label>
            <input matInput type="date" formControlName="effectiveDate">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Engineering Notes / Revision Summary</mat-label>
          <textarea matInput formControlName="notes" rows="2" placeholder="Describe change log, component revisions, or manufacturing constraints..."></textarea>
        </mat-form-field>

        <mat-divider class="my-16"></mat-divider>

        <!-- Material Line Items -->
        <div class="items-header">
          <div>
            <div class="section-title">Raw Material Line Items</div>
            <p class="section-sub">Specify component raw materials required to produce exactly ONE unit of finished good</p>
          </div>
          <button type="button" mat-raised-button color="accent" (click)="addItem()">
            <mat-icon>add</mat-icon>
            Add Material Item
          </button>
        </div>

        <div formArrayName="items" class="items-container">
          <div *ngFor="let itemGroup of items.controls; let i = index" [formGroupName]="i" class="item-row">
            <span class="row-num">#{{ i + 1 }}</span>

            <mat-form-field appearance="outline" class="flex-2">
              <mat-label>Raw Material *</mat-label>
              <mat-select formControlName="rawMaterialId" (selectionChange)="onMaterialChange(i)">
                <mat-option *ngFor="let rm of rawMaterials" [value]="rm.id">
                  {{ rm.name }} ({{ rm.sku }}) — ₹{{ rm.unitCost }}/{{ rm.unitOfMeasure }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Qty / Unit *</mat-label>
              <input matInput type="number" formControlName="quantityRequired" placeholder="1.0" min="0.0001" step="0.01">
            </mat-form-field>

            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>UoM</mat-label>
              <input matInput formControlName="unitOfMeasure" placeholder="PCS / KG">
            </mat-form-field>

            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Scrap Factor (%)</mat-label>
              <input matInput type="number" formControlName="scrapFactor" placeholder="0" min="0" max="100">
            </mat-form-field>

            <button type="button" mat-icon-button color="warn" (click)="removeItem(i)" [disabled]="items.length <= 1" title="Remove Item">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </div>

        <div *ngIf="items.length === 0" class="no-items-warning">
          Please add at least one raw material line item.
        </div>

        <div class="form-actions">
          <button type="button" mat-button routerLink="/bom">Cancel</button>
          <button type="submit" mat-raised-button color="primary" [disabled]="form.invalid || items.length === 0">
            {{ isEdit ? 'Update BOM' : 'Save Bill of Materials' }}
          </button>
        </div>
      </form>
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
    .bom-form-card {
      background: white;
      border-radius: 10px;
      padding: 28px;
    }
    .section-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .section-sub {
      font-size: 0.82rem;
      color: #64748b;
      margin: -6px 0 16px;
    }
    .form-grid-3 {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 16px;
    }
    @media (max-width: 800px) {
      .form-grid-3 {
        grid-template-columns: 1fr;
      }
    }
    .items-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .items-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .item-row {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f8fafc;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .row-num {
      font-weight: 700;
      color: #64748b;
      font-size: 0.9rem;
      width: 28px;
    }
    .flex-2 { flex: 2; }
    .flex-1 { flex: 1; }
    .w-full { width: 100%; }
    .my-16 { margin: 16px 0 !important; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
    .no-items-warning {
      color: #ef4444;
      font-weight: 600;
      padding: 12px;
      background: #fee2e2;
      border-radius: 6px;
      margin-top: 10px;
    }
  `]
})
export class BomFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bomService = inject(BomService);
  private productService = inject(ProductService);
  private rawMaterialService = inject(RawMaterialService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  form!: FormGroup;
  isEdit = false;
  bomId: number | null = null;
  products: Product[] = [];
  rawMaterials: RawMaterial[] = [];

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadDropdownData();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.bomId = +params['id'];
        this.loadBom(this.bomId);
      }
    });

    this.route.queryParams.subscribe(q => {
      if (q['productId'] && !this.isEdit) {
        this.form.patchValue({ productId: +q['productId'] });
      }
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      productId: [null, [Validators.required]],
      version: ['V1.0', [Validators.required]],
      effectiveDate: [new Date().toISOString().substring(0, 10)],
      notes: [''],
      items: this.fb.array([])
    });

    if (!this.isEdit) {
      this.addItem(); // Start with at least 1 row
    }
  }

  addItem(rawMaterialId?: number, qty?: number, uom?: string, scrap?: number): void {
    const itemGroup = this.fb.group({
      rawMaterialId: [rawMaterialId || null, [Validators.required]],
      quantityRequired: [qty || 1, [Validators.required, Validators.min(0.0001)]],
      unitOfMeasure: [uom || 'PCS'],
      scrapFactor: [scrap || 0, [Validators.min(0), Validators.max(100)]]
    });
    this.items.push(itemGroup);
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  onMaterialChange(index: number): void {
    const row = this.items.at(index);
    const rmId = row.get('rawMaterialId')?.value;
    const material = this.rawMaterials.find(m => m.id === rmId);
    if (material) {
      row.patchValue({ unitOfMeasure: material.unitOfMeasure });
    }
  }

  loadDropdownData(): void {
    this.productService.getAll().subscribe(p => this.products = p);
    this.rawMaterialService.getAll().subscribe(rm => this.rawMaterials = rm);
  }

  loadBom(id: number): void {
    this.bomService.getById(id).subscribe({
      next: (bom: any) => {
        this.form.patchValue({
          productId: bom.productId || bom.product?.id,
          version: bom.version,
          effectiveDate: bom.effectiveDate,
          notes: bom.notes
        });

        this.items.clear();
        if (bom.items && bom.items.length) {
          bom.items.forEach((item: any) => {
            this.addItem(
              item.rawMaterialId || item.rawMaterial?.id,
              item.quantityRequired,
              item.unitOfMeasure,
              item.scrapFactor
            );
          });
        } else {
          this.addItem();
        }
      },
      error: () => {
        this.snackBar.open('Failed to load BOM', 'Close', { duration: 3000 });
      }
    });
  }

  save(): void {
    if (this.form.invalid) return;

    const payload = this.form.value;

    if (this.isEdit && this.bomId) {
      this.bomService.update(this.bomId, payload).subscribe({
        next: () => {
          this.snackBar.open('BOM updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/bom']);
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Update failed', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.bomService.create(payload).subscribe({
        next: () => {
          this.snackBar.open('BOM created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/bom']);
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Create failed', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
