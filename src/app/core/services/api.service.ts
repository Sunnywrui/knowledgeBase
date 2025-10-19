import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  Conversation,
  PaginatedResponse,
  SendMessageResponse,
  Document,
  ReferenceDetail
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  // ========== 对话管理 ==========
  
  createConversation(title: string, initialMessage?: string): Observable<ApiResponse<Conversation>> {
    return this.http.post<ApiResponse<Conversation>>(
      `${this.apiUrl}/conversations/create`,
      { title, initialMessage }
    );
  }

  getConversationList(page: number = 1, pageSize: number = 20): Observable<ApiResponse<PaginatedResponse<Conversation>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<ApiResponse<PaginatedResponse<Conversation>>>(
      `${this.apiUrl}/conversations/list`,
      { params }
    );
  }

  getConversation(conversationId: string): Observable<ApiResponse<Conversation>> {
    return this.http.get<ApiResponse<Conversation>>(
      `${this.apiUrl}/conversations/${conversationId}`
    );
  }

  deleteConversation(conversationId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/conversations/${conversationId}`
    );
  }

  searchConversations(query: string, limit: number = 20): Observable<ApiResponse<Conversation[]>> {
    const params = new HttpParams()
      .set('query', query)
      .set('limit', limit.toString());
    return this.http.get<ApiResponse<Conversation[]>>(
      `${this.apiUrl}/conversations/search`,
      { params }
    );
  }

  // ========== 消息管理 ==========
  
  sendMessage(conversationId: string, content: string): Observable<ApiResponse<SendMessageResponse>> {
    return this.http.post<ApiResponse<SendMessageResponse>>(
      `${this.apiUrl}/conversations/${conversationId}/messages`,
      { content }
    );
  }

  // ========== 文档管理 ==========
  
  uploadDocument(file: File, conversationId: string): Observable<ApiResponse<Document>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId);
    return this.http.post<ApiResponse<Document>>(
      `${this.apiUrl}/documents/upload`,
      formData
    );
  }

  getDocumentStatus(documentId: string): Observable<ApiResponse<Document>> {
    return this.http.get<ApiResponse<Document>>(
      `${this.apiUrl}/documents/${documentId}/status`
    );
  }

  // ========== 参考文献管理 ==========
  
  getReferenceDetail(referenceId: string): Observable<ApiResponse<ReferenceDetail>> {
    return this.http.get<ApiResponse<ReferenceDetail>>(
      `${this.apiUrl}/references/${referenceId}`
    );
  }
}