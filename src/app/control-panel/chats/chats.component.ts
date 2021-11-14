import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BlockedUser } from 'src/app/shared/models/blocked-user.model';
import * as firebase from 'firebase/app';

import { Chat } from 'src/app/shared/models/chat.model';
import { User } from 'src/app/shared/models/user.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { FirestoreCollectionsService } from 'src/app/shared/services/firestore-collections.service';

export interface IChats {
  domainDescription: string,
  fsCollection: any,
  chatsSubscription: any,
  chats?: any
};

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss']
})
export class ChatsComponent implements OnInit, OnDestroy {
  user!: User;
  private _userSubscription!: Subscription;

  activeChats: IChats[] = [];

  activeChat!: string;

  blockForm!: FormGroup;

  chatPopUp: boolean = false;

  isBlockOptionActive: boolean = false;

  isCloseChatPopUpAcive: boolean = false;

  errorOnaAcceptChat: string = '';
  errorOnBlockUser: string = '';
  errorOnGetChats: string = '';
  errorOnAddChat: string = '';
  errorOnDeleteChat: string = '';

  constructor(
    private _authService: AuthService,
    private _firestoreCollections: FirestoreCollectionsService,
    private _fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.activeChat = JSON.parse(localStorage.getItem('operator/activeChat')!);

    new Promise<void>((resolve, reject) => {
      this._userSubscription = this._authService.user.subscribe(user => {
        this.user = user;
        if (this.user != undefined) {
          resolve();
        }
      });
    }).then(() => {
      for (const domainRole of this.user.domains!) {
        if(domainRole.checked) {
          const domainDescription = domainRole.description;
          const fsCollection = domainRole.domain;
          const chatsSubscription = '';

          const domainRoleObj = { domainDescription, fsCollection, chatsSubscription }
          this.activeChats.push(domainRoleObj)
        }
      }

      for (let i = 0; i < this.activeChats.length; i++) {
        const domain = this.activeChats[i].fsCollection;
        const status = 'activeChats';

        this.activeChats[i].chatsSubscription = this._firestoreCollections.getChats(domain, status)
        .subscribe(data => {
          this.activeChats[i].chats = data.map(e => {
            return {
              ... e.payload.doc.data()
            }
          });
          this.errorOnGetChats = '';
        }, error => {
          this.errorOnGetChats = error.message;
        });
      };
    });

    this.blockForm = this._fb.group({
      reason: [null, Validators.required]
    });
  };

  ngOnDestroy(): void {
   this._userSubscription.unsubscribe();
   
   for (const domainEl of this.activeChats) {
     domainEl.chatsSubscription.unsubscribe();
   };
  };

  acceptChat(chat: Chat) {
    const operatorDisplayName = this.user.name;
    const operatorEmail = this.user.email;
    const operator = { operatorDisplayName, operatorEmail }
    this._firestoreCollections.acceptPendingChat(chat, operator).then(() => {
      this.setActiveChat(chat.id);
      this.errorOnaAcceptChat = '';
    }, error => {
      this.errorOnaAcceptChat = error.message;
    });
  };

  setActiveChat(chatId: string) {
    this.activeChat = chatId;
    localStorage.setItem('operator/activeChat', JSON.stringify(this.activeChat));
    this.blockForm.reset();
  };

  submitBlockForm(chat: Chat, blockForm: FormGroup) {
    if (blockForm.invalid) {
      return;
    }

    const username = chat.username;
    const ip = chat.clientInformation[0].ip;
    const reason = blockForm.value.reason;
    const operator = this.user.email;
    const date = firebase.default.firestore.Timestamp.now();

    const blockedUserObj: BlockedUser = { username, ip, reason, operator, date }

    this._firestoreCollections.blockUserByIp(blockedUserObj).then(() => {
      this.cancelBLokcOption();
      this.closeChat(chat);
      this.errorOnBlockUser = '';
    }, error => {
      this.errorOnBlockUser = error.message;
    });
  };

  enableBlockOptio() {
   this.isBlockOptionActive = true;
  };

  cancelBLokcOption() {
    this.blockForm.reset();
    this.isBlockOptionActive = false;
  };

  enableChatPopUp() {
    this.isCloseChatPopUpAcive = true;
  };

  closeChat(chat: Chat) {
    this._firestoreCollections.addChat(chat, 'finishedChats').then(() => {
      this._firestoreCollections.deleteChat(chat.domain, chat.id).then(() => {
        this.disableCloseChatOption();
        for (const activeChat of this.activeChats) {
          for (const chat of activeChat.chats) {
            if (chat.id) {
              localStorage.setItem('operator/activeChat', JSON.stringify(chat.id));
              this.activeChat = JSON.parse(localStorage.getItem('operator/activeChat')!);             
            }
          }
        };
        this.errorOnDeleteChat = '';
      }, error => {
        this.errorOnDeleteChat = error.message;
      });
      this.errorOnAddChat = '';
    }, error => {
      this.errorOnAddChat = error.message;
    });
  };

  disableCloseChatOption() {
    this.isCloseChatPopUpAcive = false;
  };
}