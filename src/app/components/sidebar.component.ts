import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConversationsService } from '../core/services/conversations.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
  <aside class="sidebar">
    <button class="newconv" (click)="create()">＋ 新建对话</button>
    <div class="list">
      <button class="conv" *ngFor="let c of items()" [class.active]="c.id===activeId()" (click)="activate(c.id)">
        {{ c.title || '未命名对话' }}
      </button>
      <button class="more" (click)="more()">加载更多</button>
    </div>
  </aside>
  `
})
export class SidebarComponent{
  items = signal<any[]>([]);
  activeId = signal<string|undefined>(undefined);
  constructor(private svc:ConversationsService){
    this.svc.items$.subscribe(v=>this.items.set(v||[]));
    this.svc.activeId$.subscribe(id=>this.activeId.set(id));
    this.svc.load(100);
  }
  create(){ this.svc.create(); }
  activate(id:string){ this.svc.activate(id); }
  more(){ this.svc.load(100); }
}
