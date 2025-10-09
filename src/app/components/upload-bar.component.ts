import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="upload-bar">
      <input type="file" multiple (change)="pick($event)" />
      <span *ngIf="progress>0">上传进度：{{progress}}%</span>
    </div>
  `
})
export class UploadBarComponent{
  @Input() progress = 0;
  @Output() files = new EventEmitter<File[]>();
  pick(e:Event){
    const fl = Array.from((e.target as HTMLInputElement).files ?? []);
    if(fl.length) this.files.emit(fl);
  }
}
