import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { MenuOption } from '../shared/models/menu-option.model';
import { FirestoreCollectionsService } from '../shared/services/firestore-collections.service';
import { Domain } from '../shared/models/domains.model';
import { GenerateIdService } from '../shared/services/generate-id.service';
import { Chat, ClientInformation } from '../shared/models/chat.model';
import { BlockedUser } from '../shared/models/blocked-user.model';

export interface IClientChatData {
  chatDomain: string,
  chatId: string
}

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
  clientChatDomain!: string;
  clientChatId!: string;
  clientChatData!: IClientChatData;

  currentChat: Chat[] = [];
  private _currentChatSubscription!: Subscription;

  clientInformation: ClientInformation[] = [];

  blockedUsers!: BlockedUser[];
  private _blockedUsersSubscription!: Subscription;

  isBlocked: boolean = undefined!;

  errorOnGetActiveMenuOptions: string = '';
  erroOnGetDomains: string = '';
  errorOnGetChat: string = '';
  errorOnAddChat: string = '';
  errorOnGetBlockedUsers: string = '';
  errorOnGetClientInfo: string = '';

  constructor(
    private _fb: FormBuilder,
    private _firestoreCollections: FirestoreCollectionsService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _generateId: GenerateIdService,
    private _http: HttpClient
  ) { }

  ngOnInit(): void {
    if (this._route.snapshot.queryParams['domain']) {
      this.domain = this._route.snapshot.queryParams['domain'];

      this.clientUsername = JSON.parse(localStorage.getItem('username/' + this.domain)!);

      this.getClientInformation();

      this._menuOptionsSubscription = this._firestoreCollections.getActiveMenuOptions()
      .subscribe(menuOptions => {
        this.menuOptions = menuOptions.map(e => {
          return {
            id: e.payload.doc.id,
            ... e.payload.doc.data() as MenuOption
          }
        })
        this.errorOnGetActiveMenuOptions = '';
      }, error => {
        this.errorOnGetActiveMenuOptions = error.message;
      });

      this.startChatForm = this._fb.group({
        username: [this.clientUsername, Validators.required],
        option: [null, Validators.required]
      });
      
    
      this.clientChatData = JSON.parse(localStorage.getItem('clientChatData/' + this.domain)!);
      if (this.clientChatData) {
        this.clientChatId = this.clientChatData.chatId;
        this.clientChatDomain = this.clientChatData.chatDomain;

        this._currentChatSubscription = this._firestoreCollections.getChat(this.clientChatDomain, 'activeChats', this.clientChatId).subscribe(chat => {
          this.currentChat = chat.map(e => {
            return {
              ... e.payload.doc.data() as Chat
            }
          })
          
          if(this.currentChat.length == 0) {
            localStorage.removeItem('clientChatData/' + this.domain);
            this._currentChatSubscription.unsubscribe();
          }
  
          this.errorOnGetChat = '';
        }, error => {
          this.errorOnGetChat = error.message;
        })
      }

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
        this.erroOnGetDomains = '';
      }, error => {
        this.erroOnGetDomains = error.message;
      });
    } else {
      this._router.navigate(['/error']);
    };
  };

  ngOnDestroy(): void {
    this._menuOptionsSubscription.unsubscribe();
    
    if (this._blockedUsersSubscription) {
      this._blockedUsersSubscription.unsubscribe();
    }

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
    const clientInformation = this.clientInformation;
    const option = startChatForm.value.option;
    const domain = this.domain;
    const status = 'pending';
    const id = this._generateId.generateId();
    const chat = { username, clientInformation, option, domain, status, id};

    this.clientUsername = username;
    localStorage.setItem('username/' + this.domain, JSON.stringify(this.clientUsername));

    this.clientChatDomain = domain;
    this.clientChatId = id;
    const clientChatInfo: IClientChatData = {
      chatDomain: this.clientChatDomain,
      chatId: this.clientChatId
    };
    localStorage.setItem('clientChatData/' + this.domain, JSON.stringify(clientChatInfo));
    
    this._firestoreCollections.addChat(chat, 'activeChats').then(() => {
      this._currentChatSubscription = this._firestoreCollections.getChat(this.clientChatDomain, 'activeChats', this.clientChatId).subscribe(chat => {
        this.currentChat = chat.map(e => {
          return {
            ... e.payload.doc.data() as Chat
          }
        });
        this.errorOnGetChat = '';
      }, error => {
        this.errorOnGetChat = error.message;
      });
      this.errorOnAddChat = '';
    }, error => {
      this.errorOnAddChat = error.message;
    });
  };

  getClientInformation() {
    this._http.get("https://api.geoapify.com/v1/ipinfo?apiKey=" + environment.geoLocationAPIKey)
    .subscribe((res: any) => {
      const ip = res.ip;
      const country = res.country.name;
      const city = res.city.name;
      const clientInformationObj = { ip, country, city};

       this.clientInformation.push(clientInformationObj);

       this._blockedUsersSubscription = this._firestoreCollections.getBlockedUsersById().subscribe(blockedUsers => {
        this.blockedUsers = blockedUsers.map(e => {
          return {
            id: e.payload.doc.id,
            ... e.payload.doc.data() as BlockedUser
          }
        });
        if (this.blockedUsers.length == 0) {
          this.isBlocked = false;
        };
        
        new Promise<void>((resolve, reject) => {
          for (let i = 0; i < this.blockedUsers.length; i++) {
            if(ip == this.blockedUsers[i].ip) {
              this.isBlocked = true;
              resolve();
            } else {
              if(i == this.blockedUsers.length-1 || this.blockedUsers.length == 0) {
                this.isBlocked = false;
                resolve();
              }
            }
          }
        });
        this.errorOnGetBlockedUsers = '';
      }, error => {
        this.errorOnGetBlockedUsers = error.message;
      });
      this.errorOnGetClientInfo = '';
    }, error => {
      this.errorOnGetClientInfo = error;
    });
  };
}
