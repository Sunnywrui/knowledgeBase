import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PreviewService } from '../core/services/preview.service';

@Component({
  selector: 'app-preview-pane',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="preview">
      <header>
        <div style="font-weight:600;">{{ title || '预览' }}</div>
        <button (click)="close()" *ngIf="url">关闭</button>
      </header>
      <ng-container *ngIf="url; else empty">
        <iframe *ngIf="isWeb" class="viewer" [src]="safeUrl" title="preview"></iframe>
        <object *ngIf="isPdf" class="viewer" [data]="url" type="application/pdf"></object>
      </ng-container>
      <ng-template #empty>
        <div style="padding:16px; color:#8a8f98;">点击中间答案中的📎引用，在这里查看全文</div>
      </ng-template>
    </section>
  `
})
export class PreviewPaneComponent{
  title=''; url=''; isPdf=false; isWeb=false; safeUrl: SafeResourceUrl|null=null;
  constructor(private svc:PreviewService, private san:DomSanitizer){
    this.svc.current$.subscribe(p=>{
      if(!p){ this.reset(); return; }
      this.title=p.title; this.url=p.url;
      this.isPdf=/\.pdf($|\?)/i.test(this.url); this.isWeb=!this.isPdf;
      this.safeUrl=this.san.bypassSecurityTrustResourceUrl(this.url);
    });
  }
  close(){ this.reset(); this.svc.close(); }
  private reset(){ this.title=''; this.url=''; this.isPdf=false; this.isWeb=false; this.safeUrl=null; }
}
