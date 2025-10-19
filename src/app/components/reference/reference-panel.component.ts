import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReferenceService } from '../../core/services/reference.service';
import { ReferenceDetail } from '../../core/models';

@Component({
  selector: 'app-reference-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="reference-panel">
      <!-- 未选择状态 -->
      <div *ngIf="!(selectedReference$ | async) && !(loading$ | async)" class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>参考文献详情</h3>
        <p>点击消息中的参考文献标签<br/>查看完整内容</p>
      </div>

      <!-- 加载状态 -->
      <div *ngIf="(loading$ | async)" class="loading-state">
        <div class="spinner-large"></div>
        <p>加载中...</p>
      </div>

      <!-- 文献详情 -->
      <div *ngIf="(selectedReference$ | async) as reference" class="reference-content">
        <!-- 头部信息 -->
        <div class="reference-header">
          <div class="header-top">
            <h3 class="reference-title">{{ reference.title }}</h3>
            <button (click)="onClose()" class="btn-close" title="关闭">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414z"/>
              </svg>
            </button>
          </div>
          
          <div class="reference-meta">
            <div class="meta-item">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
              </svg>
              <span>{{ reference.source }}</span>
            </div>
            
            <div class="meta-item">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
                <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
              </svg>
              <span>第 {{ reference.context.pageNumber }} 页</span>
            </div>
            
            <div class="meta-item relevance">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M9.669.864L8 0 6.331.864l-1.858.282-.842 1.68-1.337 1.32L2.6 6l-.306 1.854 1.337 1.32.842 1.68 1.858.282L8 12l1.669-.864 1.858-.282.842-1.68 1.337-1.32L13.4 6l.306-1.854-1.337-1.32-.842-1.68L9.669.864zm1.196 1.193l.684 1.365 1.086 1.072L12.387 6l.248 1.506-1.086 1.072-.684 1.365-1.51.229L8 10.874l-1.355-.702-1.51-.229-.684-1.365-1.086-1.072L3.614 6l-.25-1.506 1.087-1.072.684-1.365 1.51-.229L8 1.126l1.356.702 1.509.229z"/>
                <path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1 4 11.794z"/>
              </svg>
              <span>相关度 {{ (reference.relevance * 100).toFixed(0) }}%</span>
            </div>
          </div>

          <div class="context-info">
            <span class="context-label">章节：</span>
            <span class="context-value">{{ reference.context.sectionTitle }}</span>
          </div>
        </div>

        <!-- 文献内容 -->
        <div class="reference-body">
          <div class="content-text">{{ reference.content }}</div>
        </div>

        <!-- 摘录信息 -->
        <div *ngIf="reference.excerpt" class="reference-excerpt">
          <div class="excerpt-label">相关摘录：</div>
          <div class="excerpt-text">{{ reference.excerpt }}</div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .reference-panel {
      width: 25%;
      background: #f8f9fa;
      border-left: 1px solid #dee2e6;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .reference-panel {
        height: 100%;
        overflow: hidden;
    }

.reference-body {
  flex: 1;
  min-height: 0;
}

    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px 20px;
      color: #6c757d;
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .empty-state h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #495057;
    }

    .empty-state p {
      font-size: 13px;
      margin: 0;
      line-height: 1.6;
    }

    .loading-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: #6c757d;
    }

    .spinner-large {
      width: 48px;
      height: 48px;
      border: 4px solid #f3f3f3;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .reference-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      background: white;
    }

    .reference-header {
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      flex-shrink: 0;
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .reference-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      flex: 1;
      line-height: 1.4;
      padding-right: 12px;
    }

    .btn-close {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .btn-close:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.05);
    }

    .reference-meta {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      opacity: 0.9;
    }

    .meta-item svg {
      flex-shrink: 0;
    }

    .meta-item.relevance {
      font-weight: 600;
    }

    .context-info {
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      font-size: 12px;
      margin-top: 8px;
    }

    .context-label {
      font-weight: 600;
      margin-right: 6px;
    }

    .context-value {
      opacity: 0.9;
    }

    .reference-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: white;
    }

    .reference-body::-webkit-scrollbar {
      width: 6px;
    }

    .reference-body::-webkit-scrollbar-thumb {
      background: #ced4da;
      border-radius: 3px;
    }

    .reference-body::-webkit-scrollbar-thumb:hover {
      background: #adb5bd;
    }

    .content-text {
      font-size: 14px;
      line-height: 1.8;
      color: #2c3e50;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .reference-excerpt {
      padding: 16px 20px;
      background: #fff3cd;
      border-top: 1px solid #ffe69c;
      flex-shrink: 0;
    }

    .excerpt-label {
      font-size: 12px;
      font-weight: 600;
      color: #856404;
      margin-bottom: 6px;
    }

    .excerpt-text {
      font-size: 13px;
      line-height: 1.6;
      color: #856404;
      font-style: italic;
    }
  `]
})
export class ReferencePanelComponent implements OnInit, OnDestroy {
  selectedReference$ = this.referenceService.getSelectedReference();
  loading$ = this.referenceService.getLoading();
  private destroy$ = new Subject<void>();

  constructor(private referenceService: ReferenceService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClose(): void {
    this.referenceService.clearSelectedReference();
  }
}