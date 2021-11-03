import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { MenuOption } from '../shared/models/menu-option.model';
import { FirestoreCollectionsService } from '../shared/services/firestore-collections.service';
import { Domain } from '../shared/models/domains.model';
import { GenerateIdService } from '../shared/services/generate-id.service';
import { Chat } from '../shared/models/chat.model';

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

  domain!: string;

  clientUsername!: string;
  clientChatId!: string;

  currentChat: Chat[] = [];
  private _currentChatSubscription!: Subscription;

  constructor(
    private _fb: FormBuilder,
    private _firestoreCollections: FirestoreCollectionsService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _generateId: GenerateIdService
  ) { }

  ngOnInit(): void {
    this.clientUsername = JSON.parse(localStorage.getItem('username')!);
    this.clientChatId = JSON.parse(localStorage.getItem('chatId')!);
        
    this.startChatForm = this._fb.group({
      username: [this.clientUsername, Validators.required],
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

    if (this._route.snapshot.queryParams['domain']) {
      this.domain = this._route.snapshot.queryParams['domain'];

      this._domainsSubscription = this._firestoreCollections.getDomains().subscribe(domains => {
        this.domains = domains.map(e => {
          return {
            id: e.payload.doc.id,
            ... e.payload.doc.data() as Domain
          }
        });
        
        new Promise<void>((resolve, reject) => {
          for (let i = 0; i < this.domains.length; i++) {            
            if(this.domains[i].domain == this.domain) {              
              return resolve();
            } else {
              if (i == this.domains.length-1) {
                this._router.navigate(['/error']);                
              }
            }
          }
        });
  
      }, error => {
  
      });
    } else {
      this._router.navigate(['/error']);
    };

    if (this.clientChatId) {
      this._currentChatSubscription = this._firestoreCollections.getChat(this.clientChatId).subscribe(chat => {
        this.currentChat = chat.map(e => {
          return {
            ... e.payload.doc.data() as Chat
          }
        })
        
        if(this.currentChat.length == 0) {
          localStorage.removeItem('domain');
          localStorage.removeItem('chatId');
          this._currentChatSubscription.unsubscribe();
        }
      }, error => {

      })
    };
  };

  ngOnDestroy(): void {
    this._menuOptionsSubscription.unsubscribe();

    if (this._currentChatSubscription) {
      this._currentChatSubscription.unsubscribe();
    };

    if (this._domainsSubscription) {
      this._domainsSubscription.unsubscribe();
    };
  };

  submitStartChatForm(startChatForm: FormGroup) {
    if (startChatForm.invalid) {
      return;
    }

    const username = startChatForm.value.username;
    const option = startChatForm.value.option;
    const domain = this.domain;
    const status = 'pending';
    const id = this._generateId.generateId();
    const chat = { username, option, domain, status, id}

    this.clientChatId = id;
    localStorage.setItem('chatId', JSON.stringify(id));
    localStorage.setItem('username', JSON.stringify(username));    
    
    this._firestoreCollections.addChat(chat).then(() => {
      this._currentChatSubscription = this._firestoreCollections.getChat(this.clientChatId).subscribe(chat => {
        this.currentChat = chat.map(e => {
          return {
            ... e.payload.doc.data() as Chat
          }
        })
             
      }, error => {

      })
    }, error => {

    });
  };
}
