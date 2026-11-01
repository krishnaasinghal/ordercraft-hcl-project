import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="layout-wrapper">
      <app-sidebar class="layout-sidebar"></app-sidebar>
      <div class="layout-main">
        <app-header class="layout-header"></app-header>
        <main class="layout-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background: #f8fafc;
    }
    .layout-sidebar {
      width: 260px;
      flex-shrink: 0;
      height: 100%;
    }
    .layout-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
    .layout-header {
      flex-shrink: 0;
    }
    .layout-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }
  `]
})
export class LayoutComponent {}
