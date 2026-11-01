import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BomService } from '../../../shared/services/bom.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-bom-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    StatusBadgeComponent
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Bills of Materials (BOM) Registry</h1>
          <p class="page-subtitle">Product recipes, multi-item components, and scrap allowances for manufacturing explosion</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/bom/new">
          <mat-icon>add</mat-icon>
          Create New BOM
        </button>
      </div>

      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!loading" class="table-container app-card">
        <table mat-table [dataSource]="boms" class="w-full">
          <ng-container matColumnDef="product">
            <th mat-header-cell *matHeaderCellDef>Target Product</th>
            <td mat-cell *matCellDef="let bom">
              <div class="font-semibold">{{ bom.productName || bom.product?.name }}</div>
              <small class="text-muted">{{ bom.productSku || bom.product?.sku }}</small>
            </td>
          </ng-container>

          <ng-container matColumnDef="version">
            <th mat-header-cell *matHeaderCellDef>Revision / Version</th>
            <td mat-cell *matCellDef="let bom">
              <span class="version-tag">{{ bom.version }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Lifecycle Status</th>
            <td mat-cell *matCellDef="let bom">
              <app-status-badge [status]="bom.status" type="order"></app-status-badge>
            </td>
          </ng-container>

          <ng-container matColumnDef="items">
            <th mat-header-cell *matHeaderCellDef>Materials</th>
            <td mat-cell *matCellDef="let bom">
              <span class="badge-count">{{ bom.items?.length || 0 }} items</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="effectiveDate">
            <th mat-header-cell *matHeaderCellDef>Effective Date</th>
            <td mat-cell *matCellDef="let bom">
              {{ bom.effectiveDate || 'Immediate' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
            <td mat-cell *matCellDef="let bom" class="text-right">
              <button *ngIf="bom.status !== 'ACTIVE'" mat-button color="primary" (click)="activate(bom)" title="Release BOM to Active">
                <mat-icon>check_circle</mat-icon>
                Activate
              </button>
              <button mat-icon-button color="primary" [routerLink]="['/bom/edit', bom.id]" title="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button *ngIf="bom.status !== 'ACTIVE'" mat-icon-button color="warn" (click)="confirmDelete(bom)" title="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>

        <div *ngIf="boms.length === 0" class="empty-state">
          No Bill of Materials defined. Click "Create New BOM" to specify product material composition.
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
    .font-semibold {
      font-weight: 600;
      color: #0f172a;
    }
    .text-muted {
      color: #64748b;
    }
    .version-tag {
      background: #f1f5f9;
      color: #0369a1;
      font-family: monospace;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
    }
    .badge-count {
      background: #f1f5f9;
      color: #334155;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
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
export class BomListComponent implements OnInit {
  private bomService = inject(BomService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  boms: any[] = [];
  loading = true;
  displayedColumns = ['product', 'version', 'status', 'items', 'effectiveDate', 'actions'];

  ngOnInit(): void {
    this.loadBoms();
  }

  loadBoms(): void {
    this.loading = true;
    this.bomService.getAll().subscribe({
      next: (data) => {
        this.boms = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load BOMs', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  activate(bom: any): void {
    this.bomService.activate(bom.id).subscribe({
      next: () => {
        this.snackBar.open(`BOM ${bom.version} is now ACTIVE`, 'Close', { duration: 3000 });
        this.loadBoms();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Activation failed', 'Close', { duration: 3000 });
      }
    });
  }

  confirmDelete(bom: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete BOM',
        message: `Are you sure you want to delete BOM version ${bom.version}? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && bom.id) {
        this.bomService.delete(bom.id).subscribe({
          next: () => {
            this.snackBar.open('BOM deleted successfully', 'Close', { duration: 3000 });
            this.loadBoms();
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Delete failed', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
