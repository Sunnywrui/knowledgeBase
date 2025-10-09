import { Injectable, NgZone } from '@angular/core';
import { Subject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AskPayload, ChatChunk, Citation } from '../types';
import { ConversationsService } from './conversations.service';

@Injectable({providedIn:'root'})
export class ChatService{
  private base='/api';
  stream$=new Subject<ChatChunk>();
  constructor(private zone:NgZone, private http:HttpClient, private conv:ConversationsService){}

  askSSE(q:string, settings?:any){
    const convId = this.conv.activeId$.value || '';
    const qs = new URLSearchParams({q, stream:'true', conversation_id:convId});
    this.zone.run(()=>this.stream$.next({type:'started'}));
    const es=new EventSource(`${this.base}/chat/stream?`+qs.toString());
    es.onmessage=(evt)=>{ try{
      const msg:ChatChunk=JSON.parse(evt.data);
      this.zone.run(()=>this.stream$.next(msg));
    }catch{}};
    es.onerror=()=>{ this.zone.run(()=>this.stream$.next({type:'done'})); es.close(); };
    return es;
  }

  async askOnce(q:string, settings?:any){
    const body:AskPayload={query:q,conversation_id:this.conv.activeId$.value,stream:false,settings};
    this.stream$.next({type:'started'});
    try{
      const resp:any=await firstValueFrom(this.http.post(`${this.base}/chat`,body));
      this.stream$.next({type:'message',data:{role:'assistant',text:resp.text}});
      if(resp.citations) this.stream$.next({type:'sources',data:resp.citations as Citation[]});
    }catch(e:any){
      this.stream$.next({type:'error',data:{msg:e?.message||'请求失败'}});
    }finally{
      this.stream$.next({type:'done'});
    }
  }
}
