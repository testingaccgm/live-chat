import { AfterViewChecked, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { ChatHistiry } from '../models/chat.model';

@Component({
  selector: 'app-chat-form-history',
  templateUrl: './chat-form-history.component.html',
  styleUrls: ['./chat-form-history.component.scss']
})
export class ChatFormHistoryComponent implements OnInit, AfterViewChecked {
  @Input() chatHistory: ChatHistiry[] | undefined = [];
  @ViewChild('chatHistoryContainer') chatHistoryContainer!: ElementRef;

  vh: number = window.innerHeight * 0.01;

  constructor() {}

  ngOnInit(): void {
    document.documentElement.style.setProperty('--vh', `${this.vh}px`);
  };

  ngAfterViewChecked(): void {
    this.chatHistoryContainer.nativeElement.scrollTop = this.chatHistoryContainer.nativeElement.scrollHeight;
  };

  @HostListener('window:resize', ['$event'])
  onResize(event: any){
    this.vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${this.vh}px`);    
  };
}
