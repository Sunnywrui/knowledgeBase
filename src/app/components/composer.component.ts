import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-composer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form class="composer" (ngSubmit)="submit()">
      <textarea [(ngModel)]="value" name="q" [placeholder]="placeholder" rows="2"></textarea>
      <button type="submit">发送</button>
    </form>
  `
})
export class ComposerComponent{
  @Input() value = '';
  @Input() placeholder = '你说点什么…';
  @Output() send = new EventEmitter<string>();
  submit(){ const q=this.value.trim(); if(q){ this.send.emit(q); this.value=''; } }
}
