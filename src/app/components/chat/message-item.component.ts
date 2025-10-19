import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message, Reference } from '../../core/models';

@Component({
  selector: 'app-message-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="message-wrapper" [class.user]="message.role === 'user'">
      <div class="message-content" [class.user-message]="message.role === 'user'" [class.assistant-message]="message.role === 'assistant'">
        <div class="message-text">{{ message.content }}</div>
        
        <!-- 参考文献区域 -->
        <div *ngIf="message.references && message.references.length > 0" class="references-section">
          <div class="references-header">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
            </svg>
            <span class="references-title">参考文献 ({{ message.references.length }})</span>
          </div>
          
          <div class="reference-list">
            <div
              *ngFor="let ref of message.references; let i = index"
              class="reference-item"
            >
              <!-- 文献标题（可点击） -->
              <button
                (click)="onSelectReference(ref)"
                class="reference-title-btn"
                [title]="'点击查看完整内容'"
              >
                <span class="ref-number">[{{ i + 1 }}]</span>
                <span class="ref-title">{{ ref.title }}</span>
                <span class="ref-relevance">{{ (ref.relevance * 100).toFixed(0) }}%</span>
                <svg class="ref-arrow" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </button>
              
              <!-- 摘要部分 -->
              <div *ngIf="ref.excerpt" class="reference-excerpt">
                <div class="excerpt-label">摘要：</div>
                <div class="excerpt-text">{{ ref.excerpt }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="message-time">{{ formatTime(message.timestamp) }}</div>
      </div>
    </div>
  `,
  styles: [`
    .message-wrapper {
      margin-bottom: 20px;
      display: flex;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message-wrapper.user {
      justify-content: flex-end;
    }

    .message-content {
      max-width: 70%;
      padding: 14px 18px;
      border-radius: 12px;
      position: relative;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .user-message {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-bottom-right-radius: 4px;
    }

    .assistant-message {
      background: white;
      color: #2c3e50;
      border: 1px solid #e9ecef;
      border-bottom-left-radius: 4px;
    }

    .message-text {
      font-size: 14px;
      line-height: 1.6;
      word-wrap: break-word;
      white-space: pre-wrap;
      margin-bottom: 8px;
    }

    /* 参考文献区域样式 */
    .references-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }

    .user-message .references-section {
      border-top-color: rgba(255, 255, 255, 0.3);
    }

    .references-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 10px;
      font-size: 12px;
      font-weight: 600;
      opacity: 0.9;
    }

    .references-title {
      color: inherit;
    }

    .reference-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .reference-item {
      background: rgba(0, 0, 0, 0.03);
      border-radius: 8px;
      padding: 10px;
      transition: all 0.2s ease;
    }

    .assistant-message .reference-item {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
    }

    .user-message .reference-item {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .reference-item:hover {
      transform: translateX(2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    /* 文献标题按钮 */
    .reference-title-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      text-align: left;
      color: inherit;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .reference-title-btn:hover {
      opacity: 0.8;
    }

    .assistant-message .reference-title-btn {
      color: #667eea;
    }

    .user-message .reference-title-btn {
      color: white;
    }

    .ref-number {
      flex-shrink: 0;
      font-weight: 700;
      font-size: 11px;
      opacity: 0.8;
    }

    .ref-title {
      flex: 1;
      text-decoration: underline;
      text-decoration-style: dotted;
      text-underline-offset: 3px;
    }

    .ref-relevance {
      flex-shrink: 0;
      padding: 2px 6px;
      background: rgba(102, 126, 234, 0.2);
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }

    .user-message .ref-relevance {
      background: rgba(255, 255, 255, 0.3);
    }

    .ref-arrow {
      flex-shrink: 0;
      opacity: 0.6;
      transition: transform 0.2s;
    }

    .reference-title-btn:hover .ref-arrow {
      transform: translateX(2px);
    }

    /* 摘要部分 */
    .reference-excerpt {
      margin-top: 8px;
      padding: 8px;
      background: rgba(255, 243, 205, 0.3);
      border-left: 3px solid #ffc107;
      border-radius: 4px;
      font-size: 12px;
      line-height: 1.5;
    }

    .assistant-message .reference-excerpt {
      background: #fff3cd;
      border-left-color: #ffc107;
      color: #856404;
    }

    .user-message .reference-excerpt {
      background: rgba(255, 255, 255, 0.2);
      border-left-color: rgba(255, 255, 255, 0.6);
    }

    .excerpt-label {
      font-weight: 600;
      margin-bottom: 4px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.8;
    }

    .excerpt-text {
      font-style: italic;
      opacity: 0.9;
    }

    .message-time {
      margin-top: 6px;
      font-size: 11px;
      opacity: 0.6;
      text-align: right;
    }
  `]
})
export class MessageItemComponent {
  @Input() message!: Message;
  @Output() selectReference = new EventEmitter<Reference>();

  onSelectReference(reference: Reference): void {
    this.selectReference.emit(reference);
  }

  formatTime(timestamp: Date): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}