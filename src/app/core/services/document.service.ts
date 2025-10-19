import { Injectable } from '@angular/core';
import { Subject, Observable, interval } from 'rxjs';
import { switchMap, takeWhile, tap, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Document } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private uploadProgress$ = new Subject<{ documentId: string; progress: number }>();
  private uploadError$ = new Subject<{ documentId: string; error: string }>();
  private uploadComplete$ = new Subject<Document>();

  constructor(private apiService: ApiService) {}

  uploadDocument(file: File, conversationId: string): Observable<Document> {
    return this.apiService.uploadDocument(file, conversationId).pipe(
      tap(response => {
        if (response.data) {
          if (response.data.status === 'processing') {
            this.startPollingStatus(response.data.id);
          } else if (response.data.status === 'failed') {
            this.uploadError$.next({
              documentId: response.data.id,
              error: '文档上传失败'
            });
          }
        }
      }),
      map(response => response.data!)
    );
  }

  private startPollingStatus(documentId: string): void {
    interval(2000)
      .pipe(
        switchMap(() => this.apiService.getDocumentStatus(documentId)),
        takeWhile(response => {
          const status = response.data?.status;
          return status === 'processing' || status === 'uploading';
        }, true)
      )
      .subscribe(response => {
        if (response.data) {
          const doc = response.data;
          this.uploadProgress$.next({
            documentId,
            progress: doc.processingProgress
          });

          if (doc.status === 'completed') {
            this.uploadComplete$.next(doc);
          } else if (doc.status === 'failed') {
            this.uploadError$.next({
              documentId,
              error: '文档处理失败'
            });
          }
        }
      });
  }

  getUploadProgress(): Observable<{ documentId: string; progress: number }> {
    return this.uploadProgress$.asObservable();
  }

  getUploadError(): Observable<{ documentId: string; error: string }> {
    return this.uploadError$.asObservable();
  }

  getUploadComplete(): Observable<Document> {
    return this.uploadComplete$.asObservable();
  }
}