import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Conversation } from '../types';

@Injectable({providedIn:'root'})
export class ConversationsService{
  private base='/api';
  items$ = new BehaviorSubject<Conversation[]>([]);
  activeId$ = new BehaviorSubject<string|undefined>(undefined);
  nextCursor:string|undefined;

  constructor(private http:HttpClient){}

  async load(limit=100){
    const qs = new URLSearchParams({ limit: String(limit), cursor: this.nextCursor || '' });
    const resp:any = await firstValueFrom(this.http.get(`${this.base}/conversations?`+qs.toString()));
    this.nextCursor = resp?.next_cursor || undefined;
    const list:Conversation[] = resp?.items || [];
    this.items$.next([...(this.items$.value||[]), ...list]);
    if(!this.activeId$.value && list.length) this.activeId$.next(list[0].id);
  }

  async create(){
    const resp:any = await firstValueFrom(this.http.post(`${this.base}/conversations`,{}));
    const conv:Conversation = resp;
    this.items$.next([conv, ...this.items$.value]);
    this.activeId$.next(conv.id);
  }

  activate(id:string){ this.activeId$.next(id); }
}
