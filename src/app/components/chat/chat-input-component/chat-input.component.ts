import { Component, Output, EventEmitter, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.css']
})
export class ChatInputComponent implements AfterViewInit {
  @Input() isDisabled: boolean | null = false;
  @Input() isLoading: boolean | null = false;
  @Output() sendMessage = new EventEmitter<string>();
  @ViewChild('inputElement') inputElement!: ElementRef<HTMLTextAreaElement>;

  messageContent = '';

  ngAfterViewInit(): void {
    this.autoResize();
  }

  onEnterPress(event: KeyboardEvent): void {
    if (event.shiftKey) return;
      event.preventDefault();
      this.onSend();
    }

  onSend(): void {
    if (this.messageContent.trim() && !this.isLoading) {
      this.sendMessage.emit(this.messageContent.trim());
      this.messageContent = '';
      setTimeout(() => this.autoResize(), 0);
    }
  }

  autoResize(): void {
    const textarea = this.inputElement?.nativeElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }
  }
}