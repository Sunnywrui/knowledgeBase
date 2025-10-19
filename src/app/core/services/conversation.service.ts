import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Conversation, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private currentConversation$ = new BehaviorSubject<Conversation | null>(null);
  private conversationList$ = new BehaviorSubject<Conversation[]>([]);
  private currentPage = 1;
  private pageSize = 20;

  constructor(private apiService: ApiService) {}

  createConversation(title: string, initialMessage?: string): Observable<Conversation> {
    return this.apiService.createConversation(title, initialMessage).pipe(
      tap(response => {
        if (response.data) {
          this.currentConversation$.next(response.data);
          const current = this.conversationList$.value;
          this.conversationList$.next([response.data, ...current]);
        }
      }),
      map(response => response.data!)
    );
  }

  getConversationList(page: number = 1): Observable<PaginatedResponse<Conversation>> {
    return this.apiService.getConversationList(page, this.pageSize).pipe(
      tap(response => {
        if (response.data) {
          if (page === 1) {
            this.conversationList$.next(response.data.items);
          } else {
            const current = this.conversationList$.value;
            this.conversationList$.next([...current, ...response.data.items]);
          }
          this.currentPage = page;
        }
      }),
      map(response => response.data!)
    );
  }

  loadMoreConversations(): Observable<PaginatedResponse<Conversation>> {
    return this.getConversationList(this.currentPage + 1);
  }

  getConversation(conversationId: string): Observable<Conversation> {
    return this.apiService.getConversation(conversationId).pipe(
      tap(response => {
        if (response.data) {
          this.currentConversation$.next(response.data);
        }
      }),
      map(response => response.data!)
    );
  }

  deleteConversation(conversationId: string): Observable<void> {
    return this.apiService.deleteConversation(conversationId).pipe(
      tap(() => {
        const conversations = this.conversationList$.value.filter(
          c => c.id !== conversationId
        );
        this.conversationList$.next(conversations);
        if (this.currentConversation$.value?.id === conversationId) {
          this.currentConversation$.next(null);
        }
      }),
      map(() => undefined)
    );
  }

  searchConversations(query: string): Observable<Conversation[]> {
    return this.apiService.searchConversations(query).pipe(
      tap(response => {
        if (response.data) {
          this.conversationList$.next(response.data);
        }
      }),
      map(response => response.data || [])
    );
  }

  getCurrentConversation(): Observable<Conversation | null> {
    return this.currentConversation$.asObservable();
  }

  getConversationList$(): Observable<Conversation[]> {
    return this.conversationList$.asObservable();
  }

  setCurrentConversation(conversation: Conversation | null): void {
    this.currentConversation$.next(conversation);
  }
}