import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatBadgeModule],
  template: `
    <header class="header-toolbar">
      <div class="header-left">
        <h2 class="page-title">Manufacturing Operations Center</h2>
      </div>

      <div class="header-right">
        <div class="user-profile" [matMenuTriggerFor]="userMenu">
          <div class="avatar-circle">
            {{ getUserInitials() }}
          </div>
          <div class="user-info">
            <span class="user-name">{{ authService.currentUser?.fullName || 'Administrator' }}</span>
            <span class="user-role">{{ authService.currentUser?.username || 'admin' }}</span>
          </div>
          <mat-icon class="dropdown-icon">expand_more</mat-icon>
        </div>

        <mat-menu #userMenu="matMenu" xPosition="before">
          <div class="menu-header">
            <strong>{{ authService.currentUser?.fullName || 'Administrator' }}</strong>
            <small>{{ authService.currentUser?.username }}</small>
          </div>
          <button mat-menu-item (click)="logout()">
            <mat-icon color="warn">logout</mat-icon>
            <span>Sign Out</span>
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    .header-toolbar {
      height: 64px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .page-title {
      font-size: 1.15rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .user-profile {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 8px;
      transition: background 0.15s;
    }
    .user-profile:hover {
      background: #f1f5f9;
    }
    .avatar-circle {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, #0284c7, #0369a1);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
    }
    .user-info {
      display: flex;
      flex-direction: column;
      text-align: left;
    }
    .user-name {
      font-weight: 600;
      font-size: 0.88rem;
      color: #0f172a;
    }
    .user-role {
      font-size: 0.75rem;
      color: #64748b;
    }
    .dropdown-icon {
      color: #64748b;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .menu-header {
      padding: 12px 16px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
    }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);

  getUserInitials(): string {
    const name = this.authService.currentUser?.fullName || 'System Administrator';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
