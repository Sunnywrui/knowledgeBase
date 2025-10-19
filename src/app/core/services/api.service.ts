import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  ApiResponse,
  Conversation,
  PaginatedResponse,
  SendMessageResponse,
  Document,
  ReferenceDetail,
  Message,
  Reference
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'http://localhost:3000/api/v1';
  private readonly mock = true; // ← 无后端时启用

  constructor(private http: HttpClient) {}

  // ---- helpers（仅用于 mock，尽量精简） ----
  private now(): Date { return new Date(); }
  private ts(): number { return Date.now(); }
  private codeOK = 200;

  private ok<T>(data: T): ApiResponse<T> {
    return { success: true, code: this.codeOK, data, timestamp: this.ts() };
  }
  private okMsg<T>(data: T, message: string): ApiResponse<T> {
    return { success: true, code: this.codeOK, data, message, timestamp: this.ts() };
  }

  // ========== 对话管理 ==========

  createConversation(title: string, initialMessage?: string): Observable<ApiResponse<Conversation>> {
    if (this.mock) {
      const createdAt = this.now();
      const updatedAt = createdAt;
      const convId = `conv_${this.ts()}`;
      const msgs: Message[] | undefined = initialMessage
        ? [{
            id: `m_${this.ts()}`,
            conversationId: convId,
            role: 'user',
            content: initialMessage,
            references: [],
            timestamp: this.now()
          }]
        : undefined;

      const conv: Conversation = {
        id: convId,
        title,
        lastMessage: msgs?.[0]?.content,
        updatedAt,
        createdAt,
        messageCount: msgs ? msgs.length : 0,
        messages: msgs
      };

      return of(this.ok(conv));
    }

    return this.http.post<ApiResponse<Conversation>>(
      `${this.apiUrl}/conversations/create`,
      { title, initialMessage }
    );
  }

  getConversationList(page: number = 1, pageSize: number = 20): Observable<ApiResponse<PaginatedResponse<Conversation>>> {
    if (this.mock) {
      const now = this.now();
      const items: Conversation[] = [
        {
          id: 'c1',
          title: 'Mock Conversation 1',
          lastMessage: 'Hello mock 1',
          createdAt: now,
          updatedAt: now,
          messageCount: 1
        },
        {
          id: 'c2',
          title: 'Mock Conversation 2',
          lastMessage: 'Hello mock 2',
          createdAt: now,
          updatedAt: now,
          messageCount: 2
        }
      ];
      const total = items.length;
      const hasMore = page * pageSize < total;

      const data: PaginatedResponse<Conversation> = {
        items,
        total,
        page,
        pageSize,
        hasMore
      };
      return of(this.ok(data));
    }

    const params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
    return this.http.get<ApiResponse<PaginatedResponse<Conversation>>>(
      `${this.apiUrl}/conversations/list`, { params }
    );
  }

  getConversation(conversationId: string): Observable<ApiResponse<Conversation>> {
    if (this.mock) {
      const now = this.now();
      const conv: Conversation = {
        id: conversationId,
        title: `Mock Conversation ${conversationId}`,
        lastMessage: undefined,
        createdAt: now,
        updatedAt: now,
        messageCount: 0,
        messages: []
      };
      return of(this.ok(conv));
    }

    return this.http.get<ApiResponse<Conversation>>(`${this.apiUrl}/conversations/${conversationId}`);
  }

  deleteConversation(conversationId: string): Observable<ApiResponse<void>> {
    if (this.mock) {
      return of(this.ok<void>(undefined as unknown as void));
    }

    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/conversations/${conversationId}`);
  }

  searchConversations(query: string, limit: number = 20): Observable<ApiResponse<Conversation[]>> {
    if (this.mock) {
      const now = this.now();
      const list: Conversation[] = [
        {
          id: `s1`,
          title: `Result for "${query}" A`,
          lastMessage: 'A...',
          createdAt: now,
          updatedAt: now,
          messageCount: 0
        },
        {
          id: `s2`,
          title: `Result for "${query}" B`,
          lastMessage: 'B...',
          createdAt: now,
          updatedAt: now,
          messageCount: 0
        }
      ].slice(0, limit);
      return of(this.ok(list));
    }

    const params = new HttpParams().set('query', query).set('limit', String(limit));
    return this.http.get<ApiResponse<Conversation[]>>(`${this.apiUrl}/conversations/search`, { params });
  }

  // ========== 消息管理 ==========

  sendMessage(conversationId: string, content: string): Observable<ApiResponse<SendMessageResponse>> {
    if (this.mock) {
      const userMsg: Message = {
        id: `m_user_${this.ts()}`,
        conversationId,
        role: 'user',
        content,
        references: [],
        timestamp: this.now()
      };

      const refs: Reference[] = [
        { id: 'r1', title: 'Mock Paper', source: 'mock://source', relevance: 0.92, excerpt: 'Lorem ipsum...' }
      ];

      const assistantMsg: Message = {
        id: `m_ai_${this.ts()}`,
        conversationId,
        role: 'assistant',
        content: `🤖 Mock reply: ${content}`,
        references: refs,
        timestamp: this.now()
      };
const data: SendMessageResponse = {
        userMessage: userMsg,
        assistantMessage: assistantMsg
      };

      return of(this.okMsg(data, 'Mock message pair'));
    }

    return this.http.post<ApiResponse<SendMessageResponse>>(
      `${this.apiUrl}/conversations/${conversationId}/messages`,
      { content }
    );
  }

  // ========== 文档管理 ==========

  uploadDocument(file: File, conversationId: string): Observable<ApiResponse<Document>> {
    if (this.mock) {
      const doc: Document = {
        id: `doc_${this.ts()}`,
        filename: file.name,
        size: file.size ?? 0,
        status: 'processing',        // uploading | processing | completed | failed
        processingProgress: 10,      // 0-100
        uploadedAt: this.now(),
        pageCount: undefined,
        conversationId
      };
      return of(this.ok(doc));
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId);
    return this.http.post<ApiResponse<Document>>(`${this.apiUrl}/documents/upload`, formData);
  }

  getDocumentStatus(documentId: string): Observable<ApiResponse<Document>> {
    if (this.mock) {
      const doc: Document = {
        id: documentId,
        filename: `mock_${documentId}.pdf`,
        size: 1024 * 42,
        status: 'completed',
        processingProgress: 100,
        uploadedAt: this.now(),
        pageCount: 12,
        conversationId: 'conv_status_mock'
      };
      return of(this.ok(doc));
    }

    return this.http.get<ApiResponse<Document>>(`${this.apiUrl}/documents/${documentId}/status`);
  }

  // ========== 参考文献管理 ==========

  getReferenceDetail(referenceId: string): Observable<ApiResponse<ReferenceDetail>> {
    if (this.mock) {
      const detail: ReferenceDetail = {
        id: referenceId,
        title: 'Mock Reference Title',
        source: 'mock://repo',
        relevance: 0.88,
        content: 'Full reference content...',
        context: { pageNumber: 3, sectionTitle: 'Introduction', position: 'para-2' },
        excerpt: 'Short excerpt...'
      };
      return of(this.ok(detail));
    }

    return this.http.get<ApiResponse<ReferenceDetail>>(`${this.apiUrl}/references/${referenceId}`);
  }
}