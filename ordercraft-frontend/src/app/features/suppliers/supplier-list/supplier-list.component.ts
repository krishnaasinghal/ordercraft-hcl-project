import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SupplierService } from '../../../shared/services/supplier.service';
import { Supplier } from '../../../shared/models/supplier.model';
import { SupplierFormComponent } from '../supplier-form/supplier-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Supplier & Vendor Directory</h1>
          <p class="page-subtitle">Track raw material vendors, procurement lead contacts, and GST credentials</p>
        </div>
        <button mat-raised-button color="primary" (click)="openSupplierDialog()">
          <mat-icon>add</mat-icon>
          Add Supplier
        </button>
      </div>

      <div class="filter-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search vendor name</mat-label>
          <input matInput [(ngModel)]="searchQuery" (keyup.enter)="loadSuppliers()" placeholder="Type and hit Enter...">
          <button mat-icon-button matSuffix (click)="loadSuppliers()">
            <mat-icon>search</mat-icon>
          </button>
        </mat-form-field>
      </div>

      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!loading" class="table-container app-card">
        <table mat-table [dataSource]="suppliers" class="w-full">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Supplier Name</th>
            <td mat-cell *matCellDef="let s">
              <strong class="color-navy">{{ s.name }}</strong>
            </td>
          </ng-container>

          <ng-container matColumnDef="contact">
            <th mat-header-cell *matHeaderCellDef>Contact Person</th>
            <td mat-cell *matCellDef="let s">
              <div>{{ s.contactPerson || '—' }}</div>
              <small class="text-muted">{{ s.email || s.phone || '—' }}</small>
            </td>
          </ng-container>

          <ng-container matColumnDef="location">
            <th mat-header-cell *matHeaderCellDef>Location</th>
            <td mat-cell *matCellDef="let s">
              {{ s.city ? s.city + ', ' + s.state : '—' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="gst">
            <th mat-header-cell *matHeaderCellDef>GST Number</th>
            <td mat-cell *matCellDef="let s">
              <code>{{ s.gstNumber || '—' }}</code>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
            <td mat-cell *matCellDef="let s" class="text-right">
              <button mat-icon-button color="primary" (click)="openSupplierDialog(s)" title="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="confirmDelete(s)" title="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>

        <div *ngIf="suppliers.length === 0" class="empty-state">
          No suppliers found. Click "Add Supplier" to register one.
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
    .search-field {
      max-width: 360px;
      width: 100%;
    }
    .table-container {
      padding: 0;
      overflow: hidden;
    }
    .w-full {
      width: 100%;
    }
    .color-navy {
      color: #0f172a;
    }
    .text-muted {
      color: #64748b;
    }
    .text-right {
      text-align: right;
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
export class SupplierListComponent implements OnInit {
  private supplierService = inject(SupplierService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  suppliers: Supplier[] = [];
  loading = true;
  searchQuery = '';
  displayedColumns = ['name', 'contact', 'location', 'gst', 'actions'];

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.loading = true;
    this.supplierService.getAll(this.searchQuery).subscribe({
      next: (data) => {
        this.suppliers = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load suppliers', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  openSupplierDialog(supplier?: Supplier): void {
    const dialogRef = this.dialog.open(SupplierFormComponent, {
      data: supplier || null,
      width: '600px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      if (supplier?.id) {
        this.supplierService.update(supplier.id, result).subscribe({
          next: () => {
            this.snackBar.open('Supplier updated successfully', 'Close', { duration: 3000 });
            this.loadSuppliers();
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Update failed', 'Close', { duration: 3000 });
          }
        });
      } else {
        this.supplierService.create(result).subscribe({
          next: () => {
            this.snackBar.open('Supplier registered successfully', 'Close', { duration: 3000 });
            this.loadSuppliers();
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Registration failed', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  confirmDelete(supplier: Supplier): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Supplier',
        message: `Are you sure you want to delete supplier "${supplier.name}"? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && supplier.id) {
        this.supplierService.delete(supplier.id).subscribe({
          next: () => {
            this.snackBar.open('Supplier deleted successfully', 'Close', { duration: 3000 });
            this.loadSuppliers();
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Delete failed', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
