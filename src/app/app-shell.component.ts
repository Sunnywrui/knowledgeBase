import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar.component';
import { ChatPaneComponent } from './components/chat-pane.component';
import { PreviewPaneComponent } from './components/preview-pane.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ChatPaneComponent, PreviewPaneComponent],
  template: `
    <header class="header">
      <img src="assets/bulb.svg" class="logo" alt="logo"/>
      <div class="title">本地知识库</div>
    </header>
    <div class="shell">
      <app-sidebar></app-sidebar>
      <app-chat-pane></app-chat-pane>
      <app-preview-pane></app-preview-pane>
    </div>
  `
})
export class AppShellComponent {}
