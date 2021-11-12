import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Chat, ChatHistiry } from '../models/chat.model';

@Component({
  selector: 'app-chat-form-history',
  templateUrl: './chat-form-history.component.html',
  styleUrls: ['./chat-form-history.component.scss']
})
export class ChatFormHistoryComponent implements OnInit {
  @Input() chatHistory: ChatHistiry[] | undefined = [];
  @ViewChild('chatHistoryContainer') chatHistoryContainer!: ElementRef<HTMLElement>;

  constructor() { }

  ngOnInit(): void {   
  };
}
