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
  @Input() userInfo!: { nick: string, chatId: string};
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
    const chatId = this.userInfo.chatId;
    const message = chatForm.value.message;
    const time = firebase.default.firestore.Timestamp.now()

    console.log(chatForm);
    console.log(this.userInfo);
  };
}
