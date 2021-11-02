import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { MenuOption } from '../shared/models/menu-option.model';
import { FirestoreCollectionsService } from '../shared/services/firestore-collections.service';
import { Domain } from '../shared/models/domains.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  startChatForm!: FormGroup;
  menuOptions!: MenuOption[];
  private _menuOptionsSubscription!: Subscription;

  domains!: Domain[];
  private _domainsSubscription!: Subscription;

  domain: string  = window.document.referrer;

  constructor(
    private _fb: FormBuilder,
    private _firestoreCollections: FirestoreCollectionsService
  ) { }

  ngOnInit(): void {
    this.startChatForm = this._fb.group({
      username: [null, Validators.required],
      option: [null, Validators.required]
    });

    this._menuOptionsSubscription = this._firestoreCollections.getActiveMenuOptions()
    .subscribe(menuOptions => {
      this.menuOptions = menuOptions.map(e => {
        return {
          id: e.payload.doc.id,
          ... e.payload.doc.data() as MenuOption
        }
      })
    }, error => {

    });

    this._domainsSubscription = this._firestoreCollections.getDomains().subscribe(domains => {
      this.domains = domains.map(e => {
        return {
          id: e.payload.doc.id,
          ... e.payload.doc.data() as Domain
        }
      })
    }, error => {

    });

    console.log(this.domain);
    
  };

  ngOnDestroy(): void {
    this._menuOptionsSubscription.unsubscribe();
    this._domainsSubscription.unsubscribe();
  };

  submitStartChatForm(startChatForm: FormGroup) {
    if (startChatForm.invalid) {
      return;
    }
    
    let domain = '';

    new Promise<void>((resolve, reject) => {
      for (let i = 0; i < this.domains.length; i++) {        
        if (this.domain.includes(this.domains[i].domain)) {
          domain = this.domains[i].domain;
          resolve();
        } else {
          if (i == this.domains.length-1) {
            domain = 'unknown';
            resolve();        
          }
        }
      }
    }).then(() => {
      const username = startChatForm.value.username;
      const option = startChatForm.value.option;
      const status = 'pending';
      const chat = { username, option, domain, status}
  
      // this._firestoreCollections.addChatOnQue(chat).then(() => {
  
      // }, error => {
  
      // });
  
      // console.log(startChatForm);
      console.log(chat);
    });
  };
}
