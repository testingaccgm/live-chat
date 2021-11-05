import { Component, Input, OnInit } from '@angular/core';
import { Chat, ChatHistiry } from '../models/chat.model';

@Component({
  selector: 'app-chat-form-history',
  templateUrl: './chat-form-history.component.html',
  styleUrls: ['./chat-form-history.component.scss']
})
export class ChatFormHistoryComponent implements OnInit {
  @Input() chatHistory: ChatHistiry[] | undefined = [];

  constructor() { }

  ngOnInit(): void {   
  };
}
