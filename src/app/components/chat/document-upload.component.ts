import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DocumentService } from '../../core/services/document.service';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="upload-container">
      <div class="upload-area" [class.dragging]="isDragging" 
           (dragover)="onDragOver($event)" 
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)">
        <input
          #fileInput
          type="file"
          (change)="onFileSelected($event)"
          [accept]="acceptedFileTypes"
          class="file-input"
          [disabled]="uploading"
        />
        
        <div class="upload-content" (click)="fileInput.click()">
          <svg class="upload-icon" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 4v16m0-16l-6 6m6-6l6 6M4 20v8h24v-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="upload-text">
            <p class="upload-title">{{ uploading ? '上传中...' : '点击或拖拽上传文档' }}</p>
            <p class="upload-subtitle">支持 PDF, Word, TXT 等格式，最大 50MB</p>
          </div>
        </div>

        <!-- 上传进度 -->
        <div *ngIf="uploadProgress > 0" class="progress-bar">
          <div class="progress-fill" [style.width.%]="uploadProgress"></div>
          <span class="progress-text">{{ uploadProgress }}%</span>
        </div>

        <!-- 错误提示 -->
        <div *ngIf="uploadError" class="error-message">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
          </svg>
          <span>{{ uploadError }}</span>
          <button (click)="clearError()" class="btn-clear-error">✕</button>
        </div>

        <!-- 成功提示 -->
        <div *ngIf="uploadSuccess" class="success-message">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>
          <span>文档上传成功！正在处理...</span>
        </div>
      </div>

      <!-- 已上传文档列表 -->
      <div *ngIf="uploadedDocuments.length > 0" class="uploaded-files">
        <div class="files-title">已上传文档：</div>
        <div class="file-list">
          <div *ngFor="let doc of uploadedDocuments" class="file-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
            </svg>
            <span class="file-name" [title]="doc.filename">{{ doc.filename }}</span>
            <span class="file-size">{{ formatFileSize(doc.size) }}</span>
            <span class="file-status" [class.completed]="doc.status === 'completed'">
              {{ getStatusText(doc.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      padding: 16px 24px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }

    .upload-area {
      border: 2px dashed #ced4da;
      border-radius: 12px;
      padding: 20px;
      background: white;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
    }

    .upload-area:hover {
      border-color: #667eea;
      background: #f8f9ff;
    }

    .upload-area.dragging {
      border-color: #667eea;
      background: #e3f2fd;
      transform: scale(1.02);
    }

    .file-input {
      display: none;
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .upload-icon {
      color: #667eea;
    }

    .upload-text {
      text-align: center;
    }

    .upload-title {
      font-size: 14px;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 4px 0;
    }

    .upload-subtitle {
      font-size: 12px;
      color: #6c757d;
      margin: 0;
    }

    .progress-bar {
      margin-top: 16px;
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
    }

    .progress-text {
      position: absolute;
      right: 8px;
      top: -20px;
      font-size: 11px;
      font-weight: 600;
      color: #667eea;
    }

    .error-message,
    .success-message {
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .error-message {
      background: #fee;
      color: #dc3545;
      border: 1px solid #f5c2c7;
    }

    .success-message {
      background: #d1e7dd;
      color: #0f5132;
      border: 1px solid #badbcc;
    }

    .btn-clear-error {
      margin-left: auto;
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .btn-clear-error:hover {
      background: rgba(0, 0, 0, 0.1);
    }

    .uploaded-files {
      margin-top: 16px;
    }

    .files-title {
      font-size: 12px;
      font-weight: 600;
      color: #495057;
      margin-bottom: 8px;
    }

    .file-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      font-size: 12px;
    }

    .file-name {
      flex: 1;
      color: #2c3e50;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-size {
      color: #6c757d;
      font-size: 11px;
    }

    .file-status {
      padding: 2px 8px;
      background: #fff3cd;
      color: #856404;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }

    .file-status.completed {
      background: #d1e7dd;
      color: #0f5132;
    }
  `]
})
export class DocumentUploadComponent implements OnDestroy {
  @Input() conversationId!: string;
  
  isDragging = false;
  uploading = false;
  uploadProgress = 0;
  uploadError = '';
  uploadSuccess = false;
  uploadedDocuments: any[] = [];
  acceptedFileTypes = '.pdf,.doc,.docx,.txt,.md';
  
  private destroy$ = new Subject<void>();
  private maxFileSize = 50 * 1024 * 1024; // 50MB

  constructor(private documentService: DocumentService) {
    this.setupProgressListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupProgressListener(): void {
    this.documentService.getUploadProgress()
      .pipe(takeUntil(this.destroy$))
      .subscribe(progress => {
        this.uploadProgress = progress.progress;
      });

    this.documentService.getUploadError()
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.uploadError = error.error;
        this.uploading = false;
        this.uploadProgress = 0;
      });

    this.documentService.getUploadComplete()
      .pipe(takeUntil(this.destroy$))
      .subscribe(doc => {
        this.uploadSuccess = true;
        this.uploading = false;
        this.uploadProgress = 0;
        this.uploadedDocuments.push(doc);
        setTimeout(() => this.uploadSuccess = false, 3000);
      });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
      input.value = '';
    }
  }

  private handleFile(file: File): void {
    // 验证文件大小
    if (file.size > this.maxFileSize) {
      this.uploadError = '文件大小超过50MB限制';
      return;
    }

    // 验证文件类型
    const validTypes = this.acceptedFileTypes.split(',');
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validTypes.includes(fileExtension)) {
      this.uploadError = '不支持的文件格式';
      return;
    }

    this.uploadError = '';
    this.uploading = true;
    this.uploadProgress = 0;

    this.documentService.uploadDocument(file, this.conversationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (error) => {
          this.uploadError = error.message || '上传失败';
          this.uploading = false;
          this.uploadProgress = 0;
        }
      });
  }

  clearError(): void {
    this.uploadError = '';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'uploading': '上传中',
      'processing': '处理中',
      'completed': '已完成',
      'failed': '失败'
    };
    return statusMap[status] || status;
  }
}