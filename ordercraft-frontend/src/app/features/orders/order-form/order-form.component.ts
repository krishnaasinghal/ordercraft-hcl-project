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
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrderService } from '../../../shared/services/order.service';
import { CustomerService } from '../../../shared/services/customer.service';
import { ProductService } from '../../../shared/services/product.service';
import { Customer } from '../../../shared/models/customer.model';
import { Product } from '../../../shared/models/product.model';
import { ORDER_PRIORITIES } from '../../../shared/models/order.model';

@Component({
  selector: 'app-order-form',
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
    MatDividerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ isEdit ? 'Edit Manufacturing Order' : 'Create Manufacturing Order' }}</h1>
          <p class="page-subtitle">Configure production batch quantities, schedule delivery target, and line items</p>
        </div>
        <button mat-button routerLink="/orders">
          <mat-icon>arrow_back</mat-icon>
          Back to Orders
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="save()" class="order-form-card app-card">
        <div class="section-title">Customer & Production Details</div>
        <div class="form-grid-3">
          <mat-form-field appearance="outline">
            <mat-label>Select Customer *</mat-label>
            <mat-select formControlName="customerId">
              <mat-option *ngFor="let c of customers" [value]="c.id">
                {{ c.name }} ({{ c.city || 'India' }})
              </mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('customerId')?.hasError('required')">Customer is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Production Priority *</mat-label>
            <mat-select formControlName="priority">
              <mat-option *ngFor="let p of priorities" [value]="p">{{ p }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Target Delivery / Due Date</mat-label>
            <input matInput type="date" formControlName="dueDate">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Production Notes & Instructions</mat-label>
          <textarea matInput formControlName="notes" rows="2" placeholder="Special batch numbers, shipping dock, packaging requirements..."></textarea>
        </mat-form-field>

        <mat-divider class="my-16"></mat-divider>

        <!-- Order Items -->
        <div class="items-header">
          <div>
            <div class="section-title">Order Line Items</div>
            <p class="section-sub">Add manufactured products and batch quantities for this order</p>
          </div>
          <button type="button" mat-raised-button color="accent" (click)="addItem()">
            <mat-icon>add</mat-icon>
            Add Product Item
          </button>
        </div>

        <div formArrayName="items" class="items-container">
          <div *ngFor="let itemGroup of items.controls; let i = index" [formGroupName]="i" class="item-row">
            <span class="row-num">#{{ i + 1 }}</span>

            <mat-form-field appearance="outline" class="flex-3">
              <mat-label>Manufactured Product *</mat-label>
              <mat-select formControlName="productId" (selectionChange)="onProductChange(i)">
                <mat-option *ngFor="let p of products" [value]="p.id">
                  {{ p.name }} ({{ p.sku }}) — ₹{{ p.unitPrice }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Batch Quantity *</mat-label>
              <input matInput type="number" formControlName="quantity" min="1" (input)="updateTotals()">
            </mat-form-field>

            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Unit Price (₹) *</mat-label>
              <input matInput type="number" formControlName="unitPrice" min="0" (input)="updateTotals()">
            </mat-form-field>

            <div class="line-total-box flex-1">
              <span class="line-label">Line Total</span>
              <strong class="line-val">₹{{ getLineTotal(i) | number:'1.2-2' }}</strong>
            </div>

            <button type="button" mat-icon-button color="warn" (click)="removeItem(i)" [disabled]="items.length <= 1" title="Remove Item">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </div>

        <!-- Order Total Summary -->
        <div class="order-summary-box">
          <div class="summary-line">
            <span>Estimated Subtotal:</span>
            <strong>₹{{ totalAmount | number:'1.2-2' }}</strong>
          </div>
          <div class="summary-line text-muted">
            <span>Estimated GST (18% on invoicing):</span>
            <span>₹{{ (totalAmount * 0.18) | number:'1.2-2' }}</span>
          </div>
          <mat-divider></mat-divider>
          <div class="summary-line total-highlight">
            <span>Estimated Final Value:</span>
            <span>₹{{ (totalAmount * 1.18) | number:'1.2-2' }}</span>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" mat-button routerLink="/orders">Cancel</button>
          <button type="submit" mat-raised-button color="primary" [disabled]="form.invalid || items.length === 0">
            {{ isEdit ? 'Update Manufacturing Order' : 'Create Manufacturing Order' }}
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
    .order-form-card {
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
    .flex-3 { flex: 3; }
    .flex-1 { flex: 1; }
    .w-full { width: 100%; }
    .my-16 { margin: 16px 0 !important; }
    .line-total-box {
      display: flex;
      flex-direction: column;
      padding: 8px 12px;
      background: #f1f5f9;
      border-radius: 6px;
      text-align: right;
    }
    .line-label {
      font-size: 0.72rem;
      color: #64748b;
      text-transform: uppercase;
    }
    .line-val {
      color: #0f172a;
      font-size: 0.95rem;
    }
    .order-summary-box {
      margin-top: 24px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px 20px;
      max-width: 360px;
      margin-left: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .summary-line {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
    }
    .total-highlight {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0284c7;
      padding-top: 4px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
  `]
})
export class OrderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  form!: FormGroup;
  isEdit = false;
  orderId: number | null = null;
  customers: Customer[] = [];
  products: Product[] = [];
  priorities = ORDER_PRIORITIES;
  totalAmount = 0;

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadDropdownData();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.orderId = +params['id'];
        this.loadOrder(this.orderId);
      }
    });
  }

  initForm(): void {
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 14);

    this.form = this.fb.group({
      customerId: [null, [Validators.required]],
      priority: ['MEDIUM', [Validators.required]],
      dueDate: [defaultDue.toISOString().substring(0, 10)],
      notes: [''],
      items: this.fb.array([])
    });

    if (!this.isEdit) {
      this.addItem();
    }
  }

  addItem(productId?: number, qty?: number, price?: number): void {
    const itemGroup = this.fb.group({
      productId: [productId || null, [Validators.required]],
      quantity: [qty || 1, [Validators.required, Validators.min(1)]],
      unitPrice: [price || 0, [Validators.required, Validators.min(0)]]
    });
    this.items.push(itemGroup);
    this.updateTotals();
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.updateTotals();
    }
  }

  onProductChange(index: number): void {
    const row = this.items.at(index);
    const prodId = row.get('productId')?.value;
    const prod = this.products.find(p => p.id === prodId);
    if (prod) {
      row.patchValue({ unitPrice: prod.unitPrice });
      this.updateTotals();
    }
  }

  getLineTotal(index: number): number {
    const row = this.items.at(index);
    const qty = row.get('quantity')?.value || 0;
    const price = row.get('unitPrice')?.value || 0;
    return qty * price;
  }

  updateTotals(): void {
    let sum = 0;
    for (let i = 0; i < this.items.length; i++) {
      sum += this.getLineTotal(i);
    }
    this.totalAmount = sum;
  }

  loadDropdownData(): void {
    this.customerService.getAll().subscribe(c => this.customers = c);
    this.productService.getAll().subscribe(p => this.products = p);
  }

  loadOrder(id: number): void {
    this.orderService.getById(id).subscribe({
      next: (order: any) => {
        this.form.patchValue({
          customerId: order.customerId || order.customer?.id,
          priority: order.priority,
          dueDate: order.dueDate,
          notes: order.notes
        });

        this.items.clear();
        if (order.items && order.items.length) {
          order.items.forEach((item: any) => {
            this.addItem(
              item.productId || item.product?.id,
              item.quantity,
              item.unitPrice
            );
          });
        }
        this.updateTotals();
      },
      error: () => {
        this.snackBar.open('Failed to load order', 'Close', { duration: 3000 });
      }
    });
  }

  save(): void {
    if (this.form.invalid) return;

    const payload = this.form.value;

    if (this.isEdit && this.orderId) {
      this.orderService.update(this.orderId, payload).subscribe({
        next: () => {
          this.snackBar.open('Manufacturing order updated', 'Close', { duration: 3000 });
          this.router.navigate(['/orders', this.orderId]);
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Update failed', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.orderService.create(payload).subscribe({
        next: (created: any) => {
          this.snackBar.open('Manufacturing order created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/orders', created.id]);
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Create failed', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
