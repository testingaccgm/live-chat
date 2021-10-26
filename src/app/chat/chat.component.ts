import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  startChatForm!: FormGroup;

  constructor(
    private _fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.startChatForm = this._fb.group({
      username: [null, Validators.required],
      option: [null, Validators.required]
    })
  }

  submitStartChatForm(startChatForm: FormGroup) {

    console.log(startChatForm);
  }
}
