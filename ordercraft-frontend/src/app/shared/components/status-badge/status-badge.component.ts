import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [ngClass]="badgeClass">
      {{ formatStatus(status) }}
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }
  `]
})
export class StatusBadgeComponent {
  @Input() status: string = '';
  @Input() type: 'order' | 'po' | 'invoice' | 'payment' | 'bom' = 'order';

  get badgeClass(): string {
    const s = this.status?.toUpperCase() || '';
    switch (s) {
      case 'COMPLETED':
      case 'PAID':
      case 'DELIVERED':
      case 'RECEIVED':
      case 'ACTIVE':
        return 'status-green';
      case 'CONFIRMED':
      case 'IN_PRODUCTION':
      case 'SENT':
      case 'ACKNOWLEDGED':
        return 'status-blue';
      case 'DRAFT':
      case 'PENDING':
      case 'PARTIALLY_PAID':
      case 'PARTIALLY_RECEIVED':
        return 'status-yellow';
      case 'CANCELLED':
      case 'OVERDUE':
      case 'FAILED':
        return 'status-red';
      case 'REFUNDED':
      case 'INACTIVE':
        return 'status-gray';
      default:
        return 'status-gray';
    }
  }

  formatStatus(status: string): string {
    if (!status) return '';
    return status.replace(/_/g, ' ');
  }
}
