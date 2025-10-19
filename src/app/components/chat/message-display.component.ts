import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message, Reference } from '../../core/models';
import { MessageItemComponent } from './message-item.component';

@Component({
  selector: 'app-message-display',
  standalone: true,
  imports: [CommonModule, MessageItemComponent],
  template: `
    <div class="messages-container" #messagesContainer>
      <div *ngIf="!messages || messages.length === 0" class="empty-messages">
        <div class="empty-icon">💬</div>
        <h3>开始新对话</h3>
        <p>上传文档或直接提问，我会基于知识库为您解答</p>
      </div>

      <div *ngIf="messages && messages.length > 0" class="messages-list">
        <app-message-item
          *ngFor="let message of messages; trackBy: trackByMessageId"
          [message]="message"
          (selectReference)="onSelectReference($event)"
        ></app-message-item>

        <!-- 加载指示器 -->
        <div *ngIf="isLoading" class="loading-message">
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span class="loading-text">正在思考...</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      background: #f8f9fa;
      scroll-behavior: smooth;
    }

    .messages-container::-webkit-scrollbar {
      width: 8px;
    }

    .messages-container::-webkit-scrollbar-thumb {
      background: #ced4da;
      border-radius: 4px;
    }

    .messages-container::-webkit-scrollbar-thumb:hover {
      background: #adb5bd;
    }

    .empty-messages {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      color: #6c757d;
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-messages h3 {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #495057;
    }

    .empty-messages p {
      font-size: 14px;
      margin: 0;
      max-width: 300px;
    }

    .messages-list {
      max-width: 900px;
      margin: 0 auto;
    }

    .loading-message {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      border-bottom-left-radius: 4px;
      max-width: 200px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .loading-dots {
      display: flex;
      gap: 4px;
    }

    .loading-dots span {
      width: 8px;
      height: 8px;
      background: #667eea;
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }

    .loading-dots span:nth-child(1) {
      animation-delay: -0.32s;
    }

    .loading-dots span:nth-child(2) {
      animation-delay: -0.16s;
    }

    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }

    .loading-text {
      font-size: 13px;
      color: #6c757d;
    }

    .messages-container {
        flex: 1;
        min-height: 0;
    }
  `]
})
export class MessageDisplayComponent implements AfterViewChecked {
  @Input() messages: Message[] | null = [];
  @Input() isLoading: boolean | null = false;
  @Output() selectReference = new EventEmitter<Reference>();
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  private shouldScroll = false;

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messages']) {
      this.shouldScroll = true;
    }
  }

  private scrollToBottom(): void {
    try {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  onSelectReference(reference: Reference): void {
    this.selectReference.emit(reference);
  }

  trackByMessageId(index: number, message: Message): string {
    return message.id;
  }
}