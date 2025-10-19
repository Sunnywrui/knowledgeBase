import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConversationService } from '../../core/services/conversation.service';
import { MessageService } from '../../core/services/message.service';
import { ReferenceService } from '../../core/services/reference.service';
import { Reference } from '../../core/models';
import { MessageDisplayComponent } from './message-display.component';
import { ChatInputComponent } from './chat-input-component/chat-input.component';
import { DocumentUploadComponent } from './document-upload.component';

@Component({
  selector: 'app-chat-area',
  standalone: true,
  imports: [
    CommonModule,
    MessageDisplayComponent,
    ChatInputComponent
  ],
  template: `
   <div class="chat-area">
    <app-message-display
        [messages]="messages$ | async"
        [isLoading]="isLoading$ | async"
        (selectReference)="onSelectReference($event)"
    ></app-message-display>

    <app-chat-input
        [isLoading]="isLoading$ | async"
        (sendMessage)="onSendMessage($event)"
    ></app-chat-input>
    </div>
  `,
  styles: [`
    .chat-area {
        flex: 1;
        height: 100%;
        min-height: 0;
    }
  `]
})
export class ChatAreaComponent implements OnInit, OnDestroy {
  messages$ = this.messageService.getMessages();
  currentConversation$ = this.conversationService.getCurrentConversation();
  isLoading$ = this.messageService.getMessageLoading();
  private destroy$ = new Subject<void>();
  private currentConvId: string = '';

  constructor(
    private conversationService: ConversationService,
    private messageService: MessageService,
    private referenceService: ReferenceService
  ) {}

  ngOnInit(): void {
    // 监听对话变化，加载消息
    this.currentConversation$
      .pipe(takeUntil(this.destroy$))
      .subscribe(conversation => {
        if (conversation) {
          this.currentConvId = conversation.id;
          if (conversation.messages) {
            this.messageService.setMessages(conversation.messages);
          } else {
            this.messageService.clearMessages();
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCurrentConversationId(): string {
    return this.currentConvId;
  }

  onSendMessage(content: string): void {
    // 如果没有当前对话，自动创建一个
    if (!this.currentConvId) {
      this.conversationService.createConversation('新对话')
        .pipe(takeUntil(this.destroy$))
        .subscribe(conv => {
          this.currentConvId = conv.id;
          this.sendMessageToConversation(conv.id, content);
        });
    } else {
      this.sendMessageToConversation(this.currentConvId, content);
    }
  }

  private sendMessageToConversation(conversationId: string, content: string): void {
    this.messageService.sendMessage(conversationId, content)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('消息发送成功');
        },
        error: (error) => {
          console.error('消息发送失败:', error);
          alert('消息发送失败，请检查网络连接');
        }
      });
  }

  onSelectReference(reference: Reference): void {
    this.referenceService.getReferenceDetail(reference.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('参考文献加载成功');
        },
        error: (error) => {
          console.error('参考文献加载失败:', error);
          alert('参考文献加载失败');
        }
      });
  }
}