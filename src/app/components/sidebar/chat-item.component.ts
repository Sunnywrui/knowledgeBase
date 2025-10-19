import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conversation } from '../../core/models';

@Component({
  selector: 'app-chat-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="chat-item"
      [class.active]="isActive"
      (click)="onSelect()"
    >
      <div class="chat-content">
        <div class="chat-title" [title]="conversation.title">
          {{ conversation.title }}
        </div>
        <div class="chat-meta">
          <span class="message-count">{{ conversation.messageCount }} 条消息</span>
          <span class="dot">•</span>
          <span class="update-time">{{ formatTime(conversation.updatedAt) }}</span>
        </div>
      </div>
      <button
        class="btn-delete"
        (click)="onDelete($event)"
        title="删除对话"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
          <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .chat-item {
      padding: 12px;
      margin-bottom: 8px;
      background: white;
      border: 1px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .chat-item:hover {
      background: #f8f9fa;
      border-color: #e9ecef;
      transform: translateX(2px);
    }

    .chat-item.active {
      background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
      border-color: #667eea;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
    }

    .chat-content {
      flex: 1;
      min-width: 0;
    }

    .chat-title {
      font-weight: 500;
      font-size: 14px;
      color: #2c3e50;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 4px;
    }

    .chat-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #7f8c8d;
    }

    .dot {
      font-size: 8px;
    }

    .btn-delete {
      background: none;
      border: none;
      color: #95a5a6;
      cursor: pointer;
      padding: 6px;
      border-radius: 4px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
    }

    .chat-item:hover .btn-delete {
      opacity: 1;
    }

    .btn-delete:hover {
      background: #fee;
      color: #e74c3c;
    }
  `]
})
export class ChatItemComponent {
  @Input() conversation!: Conversation;
  @Input() isActive = false;
  @Output() select = new EventEmitter<Conversation>();
  @Output() delete = new EventEmitter<string>();

  onSelect(): void {
    this.select.emit(this.conversation);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    if (confirm(`确定要删除对话 "${this.conversation.title}" 吗？`)) {
      this.delete.emit(this.conversation.id);
    }
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return new Date(date).toLocaleDateString('zh-CN');
  }
}