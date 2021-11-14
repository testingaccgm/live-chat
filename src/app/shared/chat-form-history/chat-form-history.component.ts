import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ChatHistiry } from '../models/chat.model';

@Component({
  selector: 'app-chat-form-history',
  templateUrl: './chat-form-history.component.html',
  styleUrls: ['./chat-form-history.component.scss']
})
export class ChatFormHistoryComponent implements AfterViewInit {
  @Input() chatHistory: ChatHistiry[] | undefined = [];
  @ViewChild('chatHistoryContainer') chatHistoryContainer!: ElementRef;

  constructor() { }

  ngAfterViewInit(): void {
    console.log('after vin');
    this.chatHistoryContainer.nativeElement.scrollTop = this.chatHistoryContainer.nativeElement.scrollHeight;
  };
}
