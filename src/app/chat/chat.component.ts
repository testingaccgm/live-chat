import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { MenuOption } from '../shared/models/menu-option.model';
import { FirestoreCollectionsService } from '../shared/services/firestore-collections.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  startChatForm!: FormGroup;
  menuOptions!: MenuOption[];
  private _menuOptionsSubscription!: Subscription;

  constructor(
    private _fb: FormBuilder,
    private _firestoreCollectionService: FirestoreCollectionsService
  ) { }

  ngOnInit(): void {
    this.startChatForm = this._fb.group({
      username: [null, Validators.required],
      option: [null, Validators.required]
    });

    this._menuOptionsSubscription = this._firestoreCollectionService.getMenuOptions()
    .subscribe(menuOptions => {
      this.menuOptions = menuOptions.map(e => {
        return {
          id: e.payload.doc.id,
          ... e.payload.doc.data() as MenuOption
        }
      })
    }, error => {

    });
  };

  ngOnDestroy(): void {
    this._menuOptionsSubscription.unsubscribe();    
  };

  submitStartChatForm(startChatForm: FormGroup) {

    console.log(startChatForm);
  };
}
