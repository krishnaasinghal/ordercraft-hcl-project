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
import { CustomerService } from '../../../shared/services/customer.service';
import { Customer } from '../../../shared/models/customer.model';
import { CustomerFormComponent } from '../customer-form/customer-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-customer-list',
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
          <h1 class="page-title">Customer Master Data</h1>
          <p class="page-subtitle">Manage client accounts, delivery locations, and GST details</p>
        </div>
        <button mat-raised-button color="primary" (click)="openCustomerDialog()">
          <mat-icon>add</mat-icon>
          Add Customer
        </button>
      </div>

      <div class="filter-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search by company name</mat-label>
          <input matInput [(ngModel)]="searchQuery" (keyup.enter)="loadCustomers()" placeholder="Type and hit Enter...">
          <button mat-icon-button matSuffix (click)="loadCustomers()">
            <mat-icon>search</mat-icon>
          </button>
        </mat-form-field>
      </div>

      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!loading" class="table-container app-card">
        <table mat-table [dataSource]="customers" class="w-full">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Company Name</th>
            <td mat-cell *matCellDef="let c">
              <strong class="color-navy">{{ c.name }}</strong>
            </td>
          </ng-container>

          <ng-container matColumnDef="contact">
            <th mat-header-cell *matHeaderCellDef>Contact Info</th>
            <td mat-cell *matCellDef="let c">
              <div>{{ c.email || '—' }}</div>
              <small class="text-muted">{{ c.phone || '—' }}</small>
            </td>
          </ng-container>

          <ng-container matColumnDef="location">
            <th mat-header-cell *matHeaderCellDef>City / State</th>
            <td mat-cell *matCellDef="let c">
              {{ c.city ? c.city + ', ' + c.state : '—' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="gst">
            <th mat-header-cell *matHeaderCellDef>GST Number</th>
            <td mat-cell *matCellDef="let c">
              <code>{{ c.gstNumber || 'Unregistered' }}</code>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
            <td mat-cell *matCellDef="let c" class="text-right">
              <button mat-icon-button color="primary" (click)="openCustomerDialog(c)" title="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="confirmDelete(c)" title="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>

        <div *ngIf="customers.length === 0" class="empty-state">
          No customers found. Click "Add Customer" to create one.
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
export class CustomerListComponent implements OnInit {
  private customerService = inject(CustomerService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  customers: Customer[] = [];
  loading = true;
  searchQuery = '';
  displayedColumns = ['name', 'contact', 'location', 'gst', 'actions'];

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.customerService.getAll(this.searchQuery).subscribe({
      next: (data) => {
        this.customers = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load customers', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  openCustomerDialog(customer?: Customer): void {
    const dialogRef = this.dialog.open(CustomerFormComponent, {
      data: customer || null,
      width: '600px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      if (customer?.id) {
        this.customerService.update(customer.id, result).subscribe({
          next: () => {
            this.snackBar.open('Customer updated successfully', 'Close', { duration: 3000 });
            this.loadCustomers();
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Update failed', 'Close', { duration: 3000 });
          }
        });
      } else {
        this.customerService.create(result).subscribe({
          next: () => {
            this.snackBar.open('Customer created successfully', 'Close', { duration: 3000 });
            this.loadCustomers();
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Create failed', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  confirmDelete(customer: Customer): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Customer',
        message: `Are you sure you want to delete customer "${customer.name}"? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && customer.id) {
        this.customerService.delete(customer.id).subscribe({
          next: () => {
            this.snackBar.open('Customer deleted successfully', 'Close', { duration: 3000 });
            this.loadCustomers();
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Delete failed', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
