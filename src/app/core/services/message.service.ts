import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Message, SendMessageResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messages$ = new BehaviorSubject<Message[]>([]);
  private messageAdded$ = new Subject<Message>();
  private messageLoading$ = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  sendMessage(conversationId: string, content: string): Observable<SendMessageResponse> {
  this.messageLoading$.next(true);
  
  // 立即显示用户消息
  const tempMsg: Message = {
    id: `temp-${Date.now()}`,
    conversationId,
    role: 'user',
    content,
    timestamp: new Date()
  };
  this.messages$.next([...this.messages$.value, tempMsg]);

  return this.apiService.sendMessage(conversationId, content).pipe(
    tap(response => {
      if (response.data) {
        const { userMessage, assistantMessage } = response.data;
        const msgs = this.messages$.value.filter(m => m.id !== tempMsg.id);
        this.messages$.next([...msgs, userMessage, assistantMessage]);
      }
      this.messageLoading$.next(false);
    }),
    map(response => response.data!)
  );
}

  setMessages(messages: Message[]): void {
    this.messages$.next(messages);
  }

  getMessages(): Observable<Message[]> {
    return this.messages$.asObservable();
  }

  getMessageAdded(): Observable<Message> {
    return this.messageAdded$.asObservable();
  }

  getMessageLoading(): Observable<boolean> {
    return this.messageLoading$.asObservable();
  }

  clearMessages(): void {
    this.messages$.next([]);
  }
}