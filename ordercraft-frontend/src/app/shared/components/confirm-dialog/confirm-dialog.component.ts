import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  color?: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon [class]="data.color === 'warn' ? 'warn-icon' : 'info-icon'">
        {{ data.color === 'warn' ? 'warning' : 'help_outline' }}
      </mat-icon>
      {{ data.title }}
    </h2>
    <mat-dialog-content>
      <p class="dialog-message">{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">
        {{ data.cancelText || 'Cancel' }}
      </button>
      <button mat-flat-button [color]="data.color || 'primary'" (click)="dialogRef.close(true)">
        {{ data.confirmText || 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      margin: 0;
    }
    .warn-icon { color: #e53935; }
    .info-icon { color: #1a237e; }
    .dialog-message {
      font-size: 14px;
      color: #555;
      line-height: 1.5;
      margin: 8px 0;
    }
    mat-dialog-actions {
      padding: 12px 0 0;
    }
  `]
})
export class ConfirmDialogComponent {
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
}
