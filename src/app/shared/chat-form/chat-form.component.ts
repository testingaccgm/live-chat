import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { FirestoreCollectionsService } from '../services/firestore-collections.service';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.scss']
})
export class ChatFormComponent implements OnInit {
  @Input() chatId!: string;
  chatForm!: FormGroup;

  constructor(
    private _firestoreCollections: FirestoreCollectionsService,
    private _fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.chatForm = this._fb.group({
      textarea: [null, Validators.required]
    });
  };

  submitChatForm(chatForm: FormGroup) {
    console.log(chatForm);
    console.log(this.chatId);
  };
}
