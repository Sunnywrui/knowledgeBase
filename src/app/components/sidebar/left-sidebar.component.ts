import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConversationService } from '../../core/services/conversation.service';
import { Conversation } from '../../core/models';
import { ChatItemComponent } from './chat-item.component';

@Component({
  selector: 'app-left-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatItemComponent],
  template: `
    <aside class="sidebar">
      <!-- 新建对话按钮 -->
      <button class="btn-new-chat" (click)="onCreateNewChat()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 5a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H6a1 1 0 1 1 0-2h3V6a1 1 0 0 1 1-1z"/>
        </svg>
        <span>新建对话</span>
      </button>

      <button class="btn-upload" (click)="fileInput.click()">
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V3a1 1 0 0 1 1-1z"/>
  </svg>
  <span>上传文档</span>
</button>
<input #fileInput type="file" style="display: none" accept=".pdf,.doc,.docx,.txt" (change)="onFileChange($event)">

      <!-- 搜索框 -->
      <div class="search-container">
        <div class="search-wrapper">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            placeholder="搜索对话..."
            class="search-input"
          />
          <button 
            *ngIf="searchQuery"
            (click)="clearSearch()"
            class="clear-btn"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- 对话历史列表 -->
      <div class="chat-list">
        <ng-container *ngIf="conversations$ | async as conversations">
          <app-chat-item
            *ngFor="let conversation of conversations; trackBy: trackByConvId"
            [conversation]="conversation"
            [isActive]="(currentConversation$ | async)?.id === conversation.id"
            (select)="onSelectConversation($event)"
            (delete)="onDeleteConversation($event)"
          ></app-chat-item>

          <div *ngIf="conversations.length === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4 4 12.954 4 24s8.954 20 20 20z" stroke="#ccc" stroke-width="2"/>
              <path d="M16 20h16M16 28h10" stroke="#ccc" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <p>{{ searchQuery ? '未找到相关对话' : '暂无对话' }}</p>
            <button *ngIf="!searchQuery" (click)="onCreateNewChat()" class="btn-create-first">
              创建第一个对话
            </button>
          </div>
        </ng-container>

        <div *ngIf="loading" class="loading-state">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>

      <!-- 加载更多 -->
      <button
        class="btn-load-more"
        (click)="onLoadMore()"
        *ngIf="!searchQuery && (hasMore$ | async)"
        [disabled]="loading"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5z"/>
        </svg>
        加载更多
      </button>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 100%;
      background: #f8f9fa;
      border-right: 1px solid #dee2e6;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .btn-new-chat {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 16px;
      margin: 16px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-new-chat:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }

    .btn-new-chat:active {
      transform: translateY(0);
    }

    .search-container {
      padding: 0 16px 16px;
    }

    .search-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      color: #6c757d;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 10px 36px 10px 36px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s ease;
      background: white;
    }

    .search-input:focus {
      outline: none;
      border-color: #667eea;
      background: #f8f9ff;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .clear-btn {
      position: absolute;
      right: 8px;
      background: none;
      border: none;
      color: #6c757d;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 16px;
      transition: all 0.2s;
    }

    .clear-btn:hover {
      background: #f1f3f5;
      color: #495057;
    }

    .chat-list {
      flex: 1;
      overflow-y: auto;
      padding: 0 12px;
    }

    .chat-list::-webkit-scrollbar {
      width: 6px;
    }

    .chat-list::-webkit-scrollbar-thumb {
      background: #ced4da;
      border-radius: 3px;
    }

    .chat-list::-webkit-scrollbar-thumb:hover {
      background: #adb5bd;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #6c757d;
    }

    .empty-state svg {
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state p {
      font-size: 14px;
      margin: 8px 0;
    }

    .btn-create-first {
      margin-top: 16px;
      padding: 8px 16px;
      background: white;
      border: 2px solid #667eea;
      color: #667eea;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.3s;
    }

    .btn-create-first:hover {
      background: #667eea;
      color: white;
    }

    .loading-state {
      text-align: center;
      padding: 20px;
      color: #6c757d;
    }

    .spinner {
      margin: 0 auto 12px;
      width: 32px;
      height: 32px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .btn-load-more {
      margin: 16px;
      padding: 10px 16px;
      border: 2px solid #e9ecef;
      background: white;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      color: #495057;
    }

    .btn-load-more:hover:not(:disabled) {
      border-color: #667eea;
      background: #f8f9ff;
      color: #667eea;
    }

    .btn-load-more:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-load-more svg {
      transform: rotate(180deg);
    }

    .btn-upload {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  padding: 12px 16px;
  margin: 0 16px 8px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.sidebar {
  height: 100%;
  overflow: hidden;
}

.chat-list {
  flex: 1;
  min-height: 0;
}
  `]
})
export class LeftSidebarComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  conversations$ = this.conversationService.getConversationList$();
  currentConversation$ = this.conversationService.getCurrentConversation();
  hasMore$ = new Subject<boolean>();
  searchQuery = '';
  loading = false;
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(private conversationService: ConversationService) {}

  ngOnInit(): void {
    this.loadInitialConversations();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        console.log('选择文件:', input.files[0].name);
        alert('文档上传功能待实现');
        input.value = '';
    }
  }

  private setupSearch(): void {
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        if (query.trim()) {
          this.performSearch(query);
        } else {
          this.loadInitialConversations();
        }
      });
  }

  private loadInitialConversations(): void {
    this.loading = true;
    this.conversationService.getConversationList(1)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.hasMore$.next(response.hasMore);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  private performSearch(query: string): void {
    this.loading = true;
    this.conversationService.searchConversations(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.hasMore$.next(false);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  onCreateNewChat(): void {
    const title = `新对话 ${new Date().toLocaleString('zh-CN')}`;
    this.conversationService.createConversation(title)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  onSelectConversation(conversation: Conversation): void {
    this.conversationService.getConversation(conversation.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  onDeleteConversation(conversationId: string): void {
    this.conversationService.deleteConversation(conversationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  onLoadMore(): void {
    this.loading = true;
    this.conversationService.loadMoreConversations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.hasMore$.next(response.hasMore);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  onSearchChange(query: string): void {
    this.searchSubject$.next(query);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchSubject$.next('');
  }

  trackByConvId(index: number, conv: Conversation): string {
    return conv.id;
  }
}