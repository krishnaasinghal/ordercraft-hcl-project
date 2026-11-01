import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../../../shared/services/product.service';
import { Product, PRODUCT_CATEGORIES } from '../../../shared/models/product.model';
import { ProductFormComponent } from '../product-form/product-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Manufactured Products Catalog</h1>
          <p class="page-subtitle">Standard product SKUs, engineering specs, unit pricing, and BOM attachments</p>
        </div>
        <button mat-raised-button color="primary" (click)="openProductDialog()">
          <mat-icon>add</mat-icon>
          Add Product
        </button>
      </div>

      <div class="filter-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search product name or SKU</mat-label>
          <input matInput [(ngModel)]="searchQuery" (keyup.enter)="loadProducts()" placeholder="e.g. Gateway, PRD-IOT...">
          <button mat-icon-button matSuffix (click)="loadProducts()">
            <mat-icon>search</mat-icon>
          </button>
        </mat-form-field>

        <mat-form-field appearance="outline" class="category-field">
          <mat-label>Category Filter</mat-label>
          <mat-select [(ngModel)]="selectedCategory" (selectionChange)="loadProducts()">
            <mat-option value="">All Categories</mat-option>
            <mat-option *ngFor="let c of categories" [value]="c">{{ c }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!loading" class="table-container app-card">
        <table mat-table [dataSource]="products" class="w-full">
          <ng-container matColumnDef="sku">
            <th mat-header-cell *matHeaderCellDef>SKU</th>
            <td mat-cell *matCellDef="let p">
              <span class="sku-badge">{{ p.sku }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Product Name & Description</th>
            <td mat-cell *matCellDef="let p">
              <div class="font-semibold">{{ p.name }}</div>
              <small class="text-muted line-clamp">{{ p.description || '—' }}</small>
            </td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Category</th>
            <td mat-cell *matCellDef="let p">
              <span class="category-tag">{{ p.category }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="unitPrice">
            <th mat-header-cell *matHeaderCellDef>Unit Price</th>
            <td mat-cell *matCellDef="let p">
              <strong>₹{{ p.unitPrice | number:'1.2-2' }}</strong> / {{ p.unitOfMeasure }}
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
            <td mat-cell *matCellDef="let p" class="text-right">
              <button mat-button color="accent" [routerLink]="['/bom/new']" [queryParams]="{ productId: p.id }" title="Build BOM">
                <mat-icon>account_tree</mat-icon>
                BOM
              </button>
              <button mat-icon-button color="primary" (click)="openProductDialog(p)" title="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="confirmDelete(p)" title="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>

        <div *ngIf="products.length === 0" class="empty-state">
          No manufactured products configured. Click "Add Product" to define one.
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
    .filter-bar {
      display: flex;
      gap: 16px;
    }
    .search-field {
      max-width: 360px;
      width: 100%;
    }
    .category-field {
      width: 200px;
    }
    .table-container {
      padding: 0;
      overflow: hidden;
    }
    .w-full {
      width: 100%;
    }
    .sku-badge {
      background: #f1f5f9;
      color: #0f172a;
      font-family: monospace;
      font-weight: 700;
      padding: 3px 6px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
    }
    .category-tag {
      background: #e0f2fe;
      color: #0369a1;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .font-semibold {
      font-weight: 600;
      color: #0f172a;
    }
    .text-muted {
      color: #64748b;
    }
    .text-right {
      text-align: right;
    }
    .line-clamp {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
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
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  products: Product[] = [];
  loading = true;
  searchQuery = '';
  selectedCategory = '';
  categories = PRODUCT_CATEGORIES;
  displayedColumns = ['sku', 'name', 'category', 'unitPrice', 'actions'];

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAll(this.selectedCategory || undefined, this.searchQuery || undefined).subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load products', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  openProductDialog(product?: Product): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      data: product || null,
      width: '600px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      if (product?.id) {
        this.productService.update(product.id, result).subscribe({
          next: () => {
            this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
            this.loadProducts();
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Update failed', 'Close', { duration: 3000 });
          }
        });
      } else {
        this.productService.create(result).subscribe({
          next: () => {
            this.snackBar.open('Product created successfully', 'Close', { duration: 3000 });
            this.loadProducts();
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Create failed', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  confirmDelete(product: Product): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Product',
        message: `Are you sure you want to delete product "${product.name}" (${product.sku})? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && product.id) {
        this.productService.delete(product.id).subscribe({
          next: () => {
            this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
            this.loadProducts();
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Delete failed', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
