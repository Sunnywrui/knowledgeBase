import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { LeftSidebarComponent } from './components/sidebar/left-sidebar.component';
import { ChatAreaComponent } from './components/chat/chat-area.component';
import { ReferencePanelComponent } from './components/reference/reference-panel.component';
import { ConversationService } from './core/services/conversation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    LeftSidebarComponent,
    ChatAreaComponent,
    ReferencePanelComponent
  ],
  template: `
    <div class="app-container">
      <app-header></app-header>
      <div class="main-content">
        <app-left-sidebar></app-left-sidebar>
        <app-chat-area></app-chat-area>
        <app-reference-panel></app-reference-panel>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
        background: #ffffff;
        box-sizing: border-box;
    }

    /* ===== 三列主区域 ===== */
    .main-content {
        flex: 1;
        display: grid;
        grid-template-columns: 280px 1fr 340px; /* 左固定 / 中自适应 / 右固定 */
        gap: 16px;
        padding: 16px;
        min-height: 0;   /* 允许内部滚动 */
        min-width: 0;
        box-sizing: border-box;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'knowledge-base';

  constructor(private conversationService: ConversationService) {}

  ngOnInit(): void {
    // 自动创建一个默认对话，确保用户可以立即使用
    // this.conversationService.createConversation('默认对话').subscribe({
    //   next: (conversation) => {
    //     console.log('默认对话已创建:', conversation);
    //   },
    //   error: (error) => {
    //     console.error('创建默认对话失败:', error);
    //   }
    // });
  }
}