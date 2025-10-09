import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Citation } from '../types';

export type ViewMsg = { role:'user'|'assistant'; html?:string; text?:string; citations?:Citation[]; time:number };

@Component({
  selector: 'app-answer-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="answer-area">
      <ng-container *ngFor="let m of messages">
        <div class="msg" [class.user]="m.role==='user'">
          <div class="msg-head">
            <span class="avatar">{{ m.role==='user' ? '我' : 'AI' }}</span>
            <span>{{ m.time | date:'HH:mm' }}</span>
            <button *ngIf="m.role==='assistant' && (m.html||m.text)" class="cite" (click)="copy.emit(m)">复制</button>
          </div>
          <div [innerHTML]="m.html || m.text"></div>
          <div class="citations" *ngIf="m.citations?.length">
            <button class="cite" *ngFor="let c of m.citations" (click)="open.emit(c)">📎 {{ c.title }}</button>
          </div>
        </div>
      </ng-container>
      <div class="msg" *ngIf="isTyping">AI 正在思考…</div>
    </div>
  `
})
export class AnswerListComponent{
  @Input() messages: ViewMsg[] = [];
  @Input() isTyping = false;
  @Output() copy = new EventEmitter<ViewMsg>();
  @Output() open = new EventEmitter<Citation>();
}
