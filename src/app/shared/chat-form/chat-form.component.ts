import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as firebase from 'firebase/app';

import { FirestoreCollectionsService } from '../services/firestore-collections.service';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.scss']
})
export class ChatFormComponent implements OnInit {
  @Input() userInfo!: { nick: string, chatId: string, domain: string };
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

  submitChatForm(chatForm: FormGroup) {
    if (chatForm.invalid) {
      return;
    }

    const nick = this.userInfo.nick;
    const chatId = this.userInfo.chatId;
    const domain = this.userInfo.domain;
    const userInfoObj = { nick, chatId, domain }

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
      this.submitChatForm(chatForm)
    }
  };
}
