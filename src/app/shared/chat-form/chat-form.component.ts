import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as firebase from 'firebase/app';

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

  constructor(
    private _firestoreCollections: FirestoreCollectionsService,
    private _fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.chatForm = this._fb.group({
      message: [null, Validators.required]
    });
  };

  ngAfterViewInit(): void {
    this.textarea.nativeElement.focus();
  };

  submitChatForm(chatForm: FormGroup) {
    if (chatForm.invalid) {
      return;
    };

    let userInfoObj;

    const chatId = this.userInfo.chatId;
    const domain = this.userInfo.domain;

    if (this.userInfo.client != undefined) {
      console.log('client');
      const client = this.userInfo.client;
      userInfoObj = { chatId, domain, client }
    } else {
      console.log('operator');
      const operator = this.userInfo.operator;
      userInfoObj = { chatId, domain, operator }
    };    

    const message = chatForm.value.message;
    const time = firebase.default.firestore.Timestamp.now();
    const chatFormObj = { message, time };

    this._firestoreCollections.addMessage(userInfoObj, chatFormObj).then(() => {
      chatForm.reset();
    }, error => {

    });
  };

  submitOnEnter(event:any, chatForm: FormGroup) {
    if (event.keyCode === 13) {
      this.submitChatForm(chatForm);
    }
  };
}
