import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as firebase from 'firebase/app';

import { ChatHistiry } from '../models/chat.model';
import { FirestoreCollectionsService } from '../services/firestore-collections.service';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.scss']
})
export class ChatFormComponent implements OnInit, AfterViewInit {
  @Input() userInfo!: { chatId: string, domain: string, client?: string, operator?: string };
  @ViewChild('textarea') textarea!: ElementRef<HTMLElement>;
  chatForm!: FormGroup;

  @Input() chatHistory: ChatHistiry[] | undefined = [];
  @ViewChild('chatHistoryContainer') chatHistoryContainer!: ElementRef;

  vh: number = window.innerHeight * 0.01;

  errorOnAddMessage: string = '';

  constructor(
    private _firestoreCollections: FirestoreCollectionsService,
    private _fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.chatForm = this._fb.group({
      message: [null, [Validators.required]]
    });

    document.documentElement.style.setProperty('--vh', `${this.vh}px`);
  };

  ngAfterViewInit(): void {
    this.chatHistoryContainer.nativeElement.scrollTop = this.chatHistoryContainer.nativeElement.scrollHeight;
    this.textarea.nativeElement.focus();
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.chatHistory && this.chatHistoryContainer != undefined && this.chatHistory?.length == changes.chatHistory.currentValue?.length) {
      setTimeout(() => {
        this.chatHistoryContainer.nativeElement.scrollTop = this.chatHistoryContainer.nativeElement.scrollHeight;
      }, 0);
    };
  };

  submitChatForm(chatForm: FormGroup) {
    if (chatForm.invalid) {
      return;
    };

    let userInfoObj;

    const chatId = this.userInfo.chatId;
    const domain = this.userInfo.domain;

    if (this.userInfo.client != undefined) {
      const client = this.userInfo.client;
      userInfoObj = { chatId, domain, client }
    } else {
      const operator = this.userInfo.operator;
      userInfoObj = { chatId, domain, operator }
    };    

    const message = chatForm.value.message.trim();
    const time = firebase.default.firestore.Timestamp.now();
    const chatFormObj = { message, time };

    this._firestoreCollections.addMessage(userInfoObj, chatFormObj).then(() => {
      this.textarea.nativeElement.focus();
      this.chatForm.reset();
      this.errorOnAddMessage = '';
    }, error => {
      this.errorOnAddMessage = error.message;
    });
  };

  submitOnEnter(event:any, chatForm: FormGroup) {
    if (event.keyCode === 13 && chatForm.value.message?.trim() != '') {
      this.submitChatForm(chatForm);
    }
  };

  @HostListener('window:resize', ['$event'])
  onResize(event: any){
    this.vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${this.vh}px`);    
  };
}
