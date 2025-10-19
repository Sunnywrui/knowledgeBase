import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../core/services/chat.service';
import { UploadService } from '../core/services/upload.service';
import { PreviewService } from '../core/services/preview.service';
import { ChatChunk, Citation } from '../types';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { AnswerListComponent, ViewMsg } from './answer-list.component';
import { UploadBarComponent } from './upload-bar.component';
import { ComposerComponent } from './composer.component';

@Component({
  selector: 'app-chat-pane',
  standalone: true,
  imports: [CommonModule, AnswerListComponent, UploadBarComponent, ComposerComponent],
  template: `
  <section class="center">
    <app-answer-list
      [messages]="messages()"
      [isTyping]="isTyping()"
      (copy)="copy($event)"
      (open)="open($event)">
    </app-answer-list>

    <app-upload-bar [progress]="progress()" (files)="upload($event)"></app-upload-bar>

    <app-composer (send)="send($event)"></app-composer>
  </section>
  `
})
export class ChatPaneComponent implements OnDestroy{
  private es?:EventSource;
  messages = signal<ViewMsg[]>([]);
  progress = signal(0);
  isTyping = signal(false);

  constructor(private chat:ChatService, private up:UploadService, private preview:PreviewService){
    this.chat.stream$.subscribe((e:ChatChunk)=>{
      if(e.type==='started'){ this.isTyping.set(true); }
      if(e.type==='token'){ this.append(e.data); }
      if(e.type==='message'){ this.setFull(e.data.text||''); }
      if(e.type==='sources'){ this.attach(e.data as Citation[]); }
      if(e.type==='error'){ this.append(`\n\n**错误：${e.data?.msg||'请求失败'}**`); }
      if(e.type==='done'){ this.isTyping.set(false); this.es?.close(); this.es=undefined; }
    });
  }

  send(q:string){
    this.messages.update(v=>[...v,{role:'user',text:q,time:Date.now()},{role:'assistant',html:'',time:Date.now()}]);
    try{ this.es=this.chat.askSSE(q); }
    catch{ this.chat.askOnce(q); }
  }

  upload(files:File[]){
    this.up.upload(files).subscribe(p=>this.progress.set(p));
  }

  append(delta:string){
    this.messages.update(v=>{
      const last=v[v.length-1];
      if(last?.role==='assistant'){
        const raw=(last.html?this.strip(last.html):'')+delta;
        last.html=DOMPurify.sanitize(marked.parse(raw) as string);
      }
      return [...v];
    });
  }

  setFull(text:string){
    this.messages.update(v=>{
      const last=v[v.length-1];
      if(last?.role==='assistant'){
        last.html=DOMPurify.sanitize(marked.parse(text) as string);
      }
      return [...v];
    });
  }

  attach(cites:Citation[]){
    this.messages.update(v=>{ const last=v[v.length-1]; if(last?.role==='assistant') last.citations=cites; return [...v]; });
  }

  open(c:Citation){ this.preview.open({title:c.title,url:c.url}); }
  copy(m:ViewMsg){ const t=this.strip(m.html||m.text||''); navigator.clipboard?.writeText(t); }

  strip(h:string){ return h.replace(/<[^>]+>/g,''); }
  ngOnDestroy(){ this.es?.close(); }
}
