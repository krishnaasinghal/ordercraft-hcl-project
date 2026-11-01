import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../shared/services/dashboard.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    StatusBadgeComponent
  ],
  template: `
    <div class="dashboard-page">
      <div class="page-title-row">
        <div>
          <h1 class="page-title">Executive Operations Dashboard</h1>
          <p class="page-subtitle">Real-time visibility across the Order-to-Cash manufacturing lifecycle</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/orders/new">
          <mat-icon>add</mat-icon>
          Create Manufacturing Order
        </button>
      </div>

      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="48"></mat-spinner>
        <span>Loading manufacturing telemetry...</span>
      </div>

      <div *ngIf="!loading && stats" class="dashboard-content">
        <!-- KPI Metrics Grid -->
        <div class="kpi-grid">
          <div class="kpi-card border-blue">
            <div class="kpi-icon-wrap bg-blue-subtle">
              <mat-icon class="kpi-icon color-blue">precision_manufacturing</mat-icon>
            </div>
            <div class="kpi-data">
              <span class="kpi-label">Total Orders</span>
              <span class="kpi-value">{{ stats.totalOrders || 0 }}</span>
              <span class="kpi-trend text-blue">Order processing active</span>
            </div>
          </div>

          <div class="kpi-card border-green">
            <div class="kpi-icon-wrap bg-green-subtle">
              <mat-icon class="kpi-icon color-green">currency_rupee</mat-icon>
            </div>
            <div class="kpi-data">
              <span class="kpi-label">Revenue Collected</span>
              <span class="kpi-value">₹{{ (stats.revenueThisMonth || stats.totalRevenue || 0) | number:'1.2-2' }}</span>
              <span class="kpi-trend text-green">Invoiced & settled</span>
            </div>
          </div>

          <div class="kpi-card border-amber">
            <div class="kpi-icon-wrap bg-amber-subtle">
              <mat-icon class="kpi-icon color-amber">pending_actions</mat-icon>
            </div>
            <div class="kpi-data">
              <span class="kpi-label">Pending POs</span>
              <span class="kpi-value">{{ stats.pendingPurchaseOrders || 0 }}</span>
              <span class="kpi-trend text-amber">Awaiting supplier receipt</span>
            </div>
          </div>

          <div class="kpi-card border-red">
            <div class="kpi-icon-wrap bg-red-subtle">
              <mat-icon class="kpi-icon color-red">warning_amber</mat-icon>
            </div>
            <div class="kpi-data">
              <span class="kpi-label">Overdue Invoices</span>
              <span class="kpi-value">{{ stats.overdueInvoices || 0 }}</span>
              <span class="kpi-trend text-red">Net-30 follow-up required</span>
            </div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="charts-grid">
          <div class="chart-card">
            <div class="card-header">
              <h3>Orders by Lifecycle Status</h3>
              <span class="chart-tag">Real-Time Distribution</span>
            </div>
            <div class="chart-canvas-wrapper doughnut-wrap">
              <canvas #statusChartCanvas></canvas>
            </div>
          </div>

          <div class="chart-card">
            <div class="card-header">
              <h3>Monthly Revenue Trend (₹)</h3>
              <span class="chart-tag">Order-to-Cash Realization</span>
            </div>
            <div class="chart-canvas-wrapper">
              <canvas #revenueChartCanvas></canvas>
            </div>
          </div>
        </div>

        <!-- Bottom Tables Grid -->
        <div class="tables-grid">
          <!-- Recent Orders -->
          <div class="table-card">
            <div class="card-header">
              <div class="header-title">
                <mat-icon color="primary">history</mat-icon>
                <h3>Recent Manufacturing Orders</h3>
              </div>
              <a mat-button color="primary" routerLink="/orders">View All</a>
            </div>

            <table mat-table [dataSource]="stats.recentOrders || []" class="order-table">
              <ng-container matColumnDef="orderNumber">
                <th mat-header-cell *matHeaderCellDef>Order #</th>
                <td mat-cell *matCellDef="let order">
                  <a [routerLink]="['/orders', order.id]" class="table-link">{{ order.orderNumber }}</a>
                </td>
              </ng-container>

              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef>Customer</th>
                <td mat-cell *matCellDef="let order">{{ order.customerName || order.customer?.name }}</td>
              </ng-container>

              <ng-container matColumnDef="totalAmount">
                <th mat-header-cell *matHeaderCellDef>Total</th>
                <td mat-cell *matCellDef="let order">₹{{ order.totalAmount | number:'1.2-2' }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let order">
                  <app-status-badge [status]="order.status" type="order"></app-status-badge>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="['orderNumber', 'customer', 'totalAmount', 'status']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['orderNumber', 'customer', 'totalAmount', 'status']"></tr>
            </table>

            <div *ngIf="!stats.recentOrders || stats.recentOrders.length === 0" class="empty-notice">
              No recent orders found.
            </div>
          </div>

          <!-- Low Stock Materials -->
          <div class="table-card">
            <div class="card-header">
              <div class="header-title">
                <mat-icon color="warn">inventory</mat-icon>
                <h3>Low Stock Materials Alert</h3>
              </div>
              <a mat-button color="warn" routerLink="/purchase-orders">Manage Procurement</a>
            </div>

            <table mat-table [dataSource]="stats.lowStockMaterials || []" class="order-table">
              <ng-container matColumnDef="sku">
                <th mat-header-cell *matHeaderCellDef>SKU</th>
                <td mat-cell *matCellDef="let rm"><strong>{{ rm.sku }}</strong></td>
              </ng-container>

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Material</th>
                <td mat-cell *matCellDef="let rm">{{ rm.name }}</td>
              </ng-container>

              <ng-container matColumnDef="stock">
                <th mat-header-cell *matHeaderCellDef>Stock / Min</th>
                <td mat-cell *matCellDef="let rm" class="color-red font-semibold">
                  {{ rm.stockQuantity }} / {{ rm.reorderLevel }} {{ rm.unitOfMeasure }}
                </td>
              </ng-container>

              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef>Action</th>
                <td mat-cell *matCellDef="let rm">
                  <span class="badge-reorder">Low Stock</span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="['sku', 'name', 'stock', 'action']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['sku', 'name', 'stock', 'action']"></tr>
            </table>

            <div *ngIf="!stats.lowStockMaterials || stats.lowStockMaterials.length === 0" class="empty-notice text-green">
              All inventory levels are above reorder threshold.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .page-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .page-title {
      font-size: 1.6rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    .page-subtitle {
      font-size: 0.9rem;
      color: #64748b;
      margin-top: 4px;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 60px;
      color: #64748b;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
    }
    .kpi-card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      border-left: 4px solid #cbd5e1;
    }
    .border-blue { border-left-color: #0284c7; }
    .border-green { border-left-color: #10b981; }
    .border-amber { border-left-color: #f59e0b; }
    .border-red { border-left-color: #ef4444; }

    .kpi-icon-wrap {
      width: 52px;
      height: 52px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .bg-blue-subtle { background: #e0f2fe; }
    .bg-green-subtle { background: #d1fae5; }
    .bg-amber-subtle { background: #fef3c7; }
    .bg-red-subtle { background: #fee2e2; }

    .color-blue { color: #0284c7; }
    .color-green { color: #10b981; }
    .color-amber { color: #d97706; }
    .color-red { color: #ef4444; }

    .kpi-data {
      display: flex;
      flex-direction: column;
    }
    .kpi-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .kpi-value {
      font-size: 1.55rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.2;
      margin: 2px 0;
    }
    .kpi-trend {
      font-size: 0.75rem;
      font-weight: 500;
    }
    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1.6fr;
      gap: 20px;
    }
    @media (max-width: 1024px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }
    .chart-card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .card-header h3 {
      font-size: 1.05rem;
      font-weight: 600;
      color: #0f172a;
      margin: 0;
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .chart-tag {
      font-size: 0.75rem;
      background: #f1f5f9;
      color: #475569;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 500;
    }
    .chart-canvas-wrapper {
      position: relative;
      height: 260px;
      width: 100%;
    }
    .doughnut-wrap {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .tables-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    @media (max-width: 900px) {
      .tables-grid {
        grid-template-columns: 1fr;
      }
    }
    .table-card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .order-table {
      width: 100%;
    }
    .table-link {
      color: #0284c7;
      font-weight: 600;
      text-decoration: none;
    }
    .table-link:hover {
      text-decoration: underline;
    }
    .badge-reorder {
      background: #fee2e2;
      color: #dc2626;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .empty-notice {
      padding: 24px;
      text-align: center;
      color: #64748b;
      font-size: 0.88rem;
    }
    .font-semibold {
      font-weight: 600;
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private dashboardService = inject(DashboardService);

  @ViewChild('statusChartCanvas') statusCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('revenueChartCanvas') revenueCanvas!: ElementRef<HTMLCanvasElement>;

  stats: any = null;
  loading = true;
  statusChart: any;
  revenueChart: any;

  ngOnInit(): void {
    this.loadStats();
  }

  ngAfterViewInit(): void {
    // Canvas initialized after data arrives
  }

  loadStats(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        setTimeout(() => this.renderCharts(), 50);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  renderCharts(): void {
    if (!this.stats) return;

    // Status Doughnut Chart
    if (this.statusCanvas) {
      if (this.statusChart) this.statusChart.destroy();
      const statusData = this.stats.ordersByStatus || {};
      const labels = Object.keys(statusData);
      const values = Object.values(statusData) as number[];

      const bgColors = [
        '#94a3b8', // DRAFT
        '#0284c7', // CONFIRMED
        '#f59e0b', // IN_PRODUCTION
        '#10b981', // COMPLETED
        '#6366f1', // DELIVERED
        '#ef4444'  // CANCELLED
      ];

      this.statusChart = new Chart(this.statusCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: labels.length ? labels : ['DRAFT', 'CONFIRMED', 'IN_PRODUCTION', 'COMPLETED'],
          datasets: [{
            data: values.length ? values : [2, 3, 5, 4],
            backgroundColor: bgColors,
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { boxWidth: 12, font: { size: 11 } }
            }
          }
        }
      });
    }

    // Revenue Bar Chart
    if (this.revenueCanvas) {
      if (this.revenueChart) this.revenueChart.destroy();
      const monthly = this.stats.monthlyRevenue || [
        { month: 'Jun', revenue: 45000 },
        { month: 'Jul', revenue: 68000 },
        { month: 'Aug', revenue: 92000 },
        { month: 'Sep', revenue: 84000 },
        { month: 'Oct', revenue: 115000 },
        { month: 'Nov', revenue: 142000 }
      ];

      this.revenueChart = new Chart(this.revenueCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: monthly.map((m: any) => m.month),
          datasets: [{
            label: 'Realized Revenue (₹)',
            data: monthly.map((m: any) => m.revenue),
            backgroundColor: '#0284c7',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (val) => '₹' + Number(val).toLocaleString()
              }
            }
          }
        }
      });
    }
  }
}
